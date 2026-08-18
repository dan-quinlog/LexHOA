/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	API_LEXHOA_GRAPHQLAPIIDOUTPUT
	DUES_AMOUNT
Amplify Params - DO NOT EDIT */

const aws = require('aws-sdk');

function parseDuesAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('INVALID_DUES_CONFIGURATION');
    }
    return amount;
}

function billingPeriod(date) {
    return date.toISOString().slice(0, 7);
}

function createDynamoDependencies(client, apiId, env) {
    const propertyTable = `Property-${apiId}-${env}`;
    const profileTable = `Profile-${apiId}-${env}`;

    return {
        async scanProperties(exclusiveStartKey) {
            const params = {
                TableName: propertyTable,
                ProjectionExpression: 'profOwnerId'
            };
            if (exclusiveStartKey) params.ExclusiveStartKey = exclusiveStartKey;
            return client.scan(params).promise();
        },

        async chargeProfile(profileId, amount, period, timestamp) {
            try {
                await client.update({
                    TableName: profileTable,
                    Key: { id: profileId },
                    UpdateExpression: 'SET #balance = if_not_exists(#balance, :zero) + :dues, lastMonthlyDuesPeriod = :period, updatedAt = :timestamp',
                    ConditionExpression: 'attribute_exists(id) AND (attribute_not_exists(lastMonthlyDuesPeriod) OR lastMonthlyDuesPeriod <> :period)',
                    ExpressionAttributeNames: { '#balance': 'balance' },
                    ExpressionAttributeValues: {
                        ':zero': 0,
                        ':dues': amount,
                        ':period': period,
                        ':timestamp': timestamp
                    }
                }).promise();
                return 'charged';
            } catch (error) {
                if (error && error.code === 'ConditionalCheckFailedException') return 'skipped';
                throw error;
            }
        }
    };
}

async function processMonthlyDues({ amount, now, dependencies }) {
    const ownerIds = new Set();
    let lastEvaluatedKey;

    do {
        const page = await dependencies.scanProperties(lastEvaluatedKey);
        for (const property of page.Items || []) {
            if (typeof property.profOwnerId === 'string' && property.profOwnerId.trim()) {
                ownerIds.add(property.profOwnerId);
            }
        }
        lastEvaluatedKey = page.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    const period = billingPeriod(now);
    const timestamp = now.toISOString();
    let charged = 0;
    let skipped = 0;
    let failed = 0;

    for (const ownerId of ownerIds) {
        try {
            const outcome = await dependencies.chargeProfile(ownerId, amount, period, timestamp);
            if (outcome === 'charged') charged += 1;
            else skipped += 1;
        } catch (error) {
            failed += 1;
        }
    }

    const counts = { owners: ownerIds.size, charged, skipped, failed };
    if (failed > 0) {
        const error = new Error('MONTHLY_DUES_PARTIAL_FAILURE');
        error.counts = counts;
        throw error;
    }
    return counts;
}

exports.handler = async () => {
    try {
        const amount = parseDuesAmount(process.env.DUES_AMOUNT);
        const now = new Date();
        const client = new aws.DynamoDB.DocumentClient();
        const dependencies = createDynamoDependencies(
            client,
            process.env.API_LEXHOA_GRAPHQLAPIIDOUTPUT,
            process.env.ENV
        );
        const counts = await processMonthlyDues({ amount, now, dependencies });
        console.info('monthly_dues_complete', counts);
        return {
            success: true,
            message: `Monthly dues processing complete: ${counts.charged} charged, ${counts.skipped} skipped.`
        };
    } catch (error) {
        const code = error && error.message === 'INVALID_DUES_CONFIGURATION'
            ? 'INVALID_DUES_CONFIGURATION'
            : 'MONTHLY_DUES_PROCESSING_FAILED';
        const counts = error && error.counts
            ? error.counts
            : { owners: 0, charged: 0, skipped: 0, failed: 1 };
        console.error('monthly_dues_failed', { code, counts });
        throw new Error(code);
    }
};

exports._internals = {
    billingPeriod,
    createDynamoDependencies,
    parseDuesAmount,
    processMonthlyDues
};
