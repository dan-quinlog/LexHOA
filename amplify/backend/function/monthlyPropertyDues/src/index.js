/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	API_LEXHOA_GRAPHQLAPIIDOUTPUT
	DUES_AMOUNT
Amplify Params - DO NOT EDIT */

const aws = require('aws-sdk');

const INVOICE_COUNTER_ID = 'INVOICE';
const MAX_WRITE_ATTEMPTS = 5;

function parseDuesAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('INVALID_DUES_CONFIGURATION');
    }
    return amount;
}

// Dues created on November 1 bill the following calendar year.
function billingPeriod(date) {
    return String(date.getUTCFullYear() + 1);
}

function invoiceNumber(seq) {
    return `INV-${String(seq).padStart(6, '0')}`;
}

function duesInvoice({ ownerId, owner, properties, amount, period, seq, now }) {
    const amountCents = Math.round(amount * 100);
    const timestamp = now.toISOString();
    const invoice = {
        __typename: 'Invoice',
        id: `dues-${period}-${ownerId}`,
        invoiceNumber: invoiceNumber(seq),
        type: 'DUES',
        status: 'ISSUED',
        billingPeriod: period,
        lineItems: properties.map(property => ({
            propertyId: property.id,
            address: property.address,
            description: `${period} annual dues`,
            amount: amountCents / 100
        })),
        totalAmount: (amountCents * properties.length) / 100,
        balanceApplied: true,
        dateApplied: timestamp.slice(0, 10),
        dateDue: `${period}-12-31`,
        description: `${period} annual HOA dues`,
        createdBy: 'SYSTEM',
        ownerInvoicesId: ownerId,
        byTypeDateApplied: 'INVOICE',
        createdAt: timestamp,
        updatedAt: timestamp
    };
    if (owner) invoice.owner = owner;
    return invoice;
}

function createDynamoDependencies(client, apiId, env) {
    const propertyTable = `Property-${apiId}-${env}`;
    const profileTable = `Profile-${apiId}-${env}`;
    const invoiceTable = `Invoice-${apiId}-${env}`;
    const counterTable = `Counter-${apiId}-${env}`;

    return {
        async scanProperties(exclusiveStartKey) {
            const params = {
                TableName: propertyTable,
                ProjectionExpression: '#id, #address, #profOwnerId',
                ExpressionAttributeNames: { '#id': 'id', '#address': 'address', '#profOwnerId': 'profOwnerId' }
            };
            if (exclusiveStartKey) params.ExclusiveStartKey = exclusiveStartKey;
            return client.scan(params).promise();
        },

        async getProfile(profileId) {
            const result = await client.get({
                TableName: profileTable,
                Key: { id: profileId },
                ProjectionExpression: '#id, #owner, cognitoID',
                ExpressionAttributeNames: { '#id': 'id', '#owner': 'owner' }
            }).promise();
            return result.Item;
        },

        async invoiceExists(invoiceId) {
            const result = await client.get({
                TableName: invoiceTable,
                Key: { id: invoiceId },
                ProjectionExpression: '#id',
                ExpressionAttributeNames: { '#id': 'id' },
                ConsistentRead: true
            }).promise();
            return Boolean(result.Item);
        },

        async readInvoiceCounter() {
            const result = await client.get({
                TableName: counterTable,
                Key: { id: INVOICE_COUNTER_ID },
                ConsistentRead: true
            }).promise();
            return result.Item ? result.Item.seq : 0;
        },

        // Creates the invoice, advances the counter from the value read, and charges the
        // balance in one transaction. Any changed precondition cancels all three writes.
        async writeInvoice(invoice, previousSeq) {
            const counterCondition = previousSeq === 0
                ? 'attribute_not_exists(#seq)'
                : '#seq = :previous';
            const counterValues = {
                ':next': previousSeq + 1,
                ':typename': 'Counter',
                ':timestamp': invoice.updatedAt
            };
            if (previousSeq !== 0) counterValues[':previous'] = previousSeq;

            await client.transactWrite({
                TransactItems: [
                    {
                        Put: {
                            TableName: invoiceTable,
                            Item: invoice,
                            ConditionExpression: 'attribute_not_exists(id)'
                        }
                    },
                    {
                        Update: {
                            TableName: counterTable,
                            Key: { id: INVOICE_COUNTER_ID },
                            UpdateExpression: 'SET #seq = :next, #typename = :typename, createdAt = if_not_exists(createdAt, :timestamp), updatedAt = :timestamp',
                            ConditionExpression: counterCondition,
                            ExpressionAttributeNames: { '#seq': 'seq', '#typename': '__typename' },
                            ExpressionAttributeValues: counterValues
                        }
                    },
                    {
                        Update: {
                            TableName: profileTable,
                            Key: { id: invoice.ownerInvoicesId },
                            UpdateExpression: 'SET #balance = if_not_exists(#balance, :zero) + :total, updatedAt = :timestamp',
                            ConditionExpression: 'attribute_exists(id)',
                            ExpressionAttributeNames: { '#balance': 'balance' },
                            ExpressionAttributeValues: {
                                ':zero': 0,
                                ':total': invoice.totalAmount,
                                ':timestamp': invoice.updatedAt
                            }
                        }
                    }
                ]
            }).promise();
        }
    };
}

async function invoiceOwner({ ownerId, properties, amount, period, now, dependencies }) {
    const invoiceId = `dues-${period}-${ownerId}`;
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
        if (await dependencies.invoiceExists(invoiceId)) return 'skipped';
        const profile = await dependencies.getProfile(ownerId);
        if (!profile) return 'skipped';

        const seq = await dependencies.readInvoiceCounter();
        const invoice = duesInvoice({
            ownerId,
            owner: profile.owner || profile.cognitoID,
            properties,
            amount,
            period,
            seq: seq + 1,
            now
        });
        try {
            await dependencies.writeInvoice(invoice, seq);
            return 'charged';
        } catch (error) {
            // Another writer took this invoice number or created the invoice; re-read and retry.
            if (!error || error.code !== 'TransactionCanceledException') throw error;
        }
    }
    throw new Error('INVOICE_WRITE_CONFLICT');
}

async function processMonthlyDues({ amount, now, dependencies }) {
    const propertiesByOwner = new Map();
    let lastEvaluatedKey;

    do {
        const page = await dependencies.scanProperties(lastEvaluatedKey);
        for (const property of page.Items || []) {
            if (typeof property.profOwnerId === 'string' && property.profOwnerId.trim()) {
                const properties = propertiesByOwner.get(property.profOwnerId) || [];
                properties.push({ id: property.id, address: property.address });
                propertiesByOwner.set(property.profOwnerId, properties);
            }
        }
        lastEvaluatedKey = page.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    const period = billingPeriod(now);
    let charged = 0;
    let skipped = 0;
    let failed = 0;

    for (const [ownerId, properties] of propertiesByOwner) {
        properties.sort((a, b) => String(a.address || '').localeCompare(String(b.address || '')));
        try {
            const outcome = await invoiceOwner({ ownerId, properties, amount, period, now, dependencies });
            if (outcome === 'charged') charged += 1;
            else skipped += 1;
        } catch (error) {
            failed += 1;
        }
    }

    const counts = { owners: propertiesByOwner.size, charged, skipped, failed };
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
        console.info('annual_dues_complete', counts);
        return {
            success: true,
            message: `Annual dues processing complete: ${counts.charged} invoiced, ${counts.skipped} skipped.`
        };
    } catch (error) {
        const code = error && error.message === 'INVALID_DUES_CONFIGURATION'
            ? 'INVALID_DUES_CONFIGURATION'
            : 'MONTHLY_DUES_PROCESSING_FAILED';
        const counts = error && error.counts
            ? error.counts
            : { owners: 0, charged: 0, skipped: 0, failed: 1 };
        console.error('annual_dues_failed', { code, counts });
        throw new Error(code);
    }
};

exports._internals = {
    billingPeriod,
    createDynamoDependencies,
    duesInvoice,
    invoiceNumber,
    parseDuesAmount,
    processMonthlyDues
};
