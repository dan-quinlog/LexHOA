const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
    createDynamoDependencies,
    parseDuesAmount,
    processMonthlyDues
} = require('./index')._internals;

const now = new Date('2026-08-18T12:00:00.000Z');

function memoryDependencies(pages, options = {}) {
    const balances = new Map();
    const periods = new Map();
    const failedOnce = new Set();
    let pageIndex = 0;

    return {
        dependencies: {
            async scanProperties() {
                return pages[Math.min(pageIndex++, pages.length - 1)];
            },
            async chargeProfile(ownerId, amount, period) {
                if (options.failOnce === ownerId && !failedOnce.has(ownerId)) {
                    failedOnce.add(ownerId);
                    throw new Error('sensitive-owner-marker');
                }
                if (periods.get(ownerId) === period) return 'skipped';
                periods.set(ownerId, period);
                balances.set(ownerId, (balances.get(ownerId) || 0) + amount);
                return 'charged';
            }
        },
        resetPages() { pageIndex = 0; },
        balances
    };
}

test('discovers unique owners from properties and charges each once', async () => {
    const store = memoryDependencies([{
        Items: [
            { profOwnerId: 'owner-a' },
            { profOwnerId: 'owner-a' },
            { profOwnerId: 'owner-b' },
            { profOwnerId: '' },
            {}
        ]
    }]);
    const counts = await processMonthlyDues({ amount: 50, now, dependencies: store.dependencies });
    assert.deepEqual(counts, { owners: 2, charged: 2, skipped: 0, failed: 0 });
    assert.equal(store.balances.get('owner-a'), 50);
    assert.equal(store.balances.get('owner-b'), 50);
});

test('same-month invocation is idempotent', async () => {
    const pages = [{ Items: [{ profOwnerId: 'owner-a' }] }];
    const store = memoryDependencies(pages);
    await processMonthlyDues({ amount: 50, now, dependencies: store.dependencies });
    store.resetPages();
    const retry = await processMonthlyDues({ amount: 50, now, dependencies: store.dependencies });
    assert.deepEqual(retry, { owners: 1, charged: 0, skipped: 1, failed: 0 });
    assert.equal(store.balances.get('owner-a'), 50);
});

test('partial retry skips completed owners and finishes remaining owners', async () => {
    const pages = [{ Items: [{ profOwnerId: 'owner-a' }, { profOwnerId: 'owner-b' }] }];
    const store = memoryDependencies(pages, { failOnce: 'owner-b' });
    await assert.rejects(
        processMonthlyDues({ amount: 50, now, dependencies: store.dependencies }),
        /MONTHLY_DUES_PARTIAL_FAILURE/
    );
    store.resetPages();
    const retry = await processMonthlyDues({ amount: 50, now, dependencies: store.dependencies });
    assert.deepEqual(retry, { owners: 2, charged: 1, skipped: 1, failed: 0 });
    assert.equal(store.balances.get('owner-a'), 50);
    assert.equal(store.balances.get('owner-b'), 50);
});

test('paginates the Property table', async () => {
    let page = 0;
    const keys = [];
    const dependencies = {
        async scanProperties(key) {
            keys.push(key || null);
            page += 1;
            return page === 1
                ? { Items: [{ profOwnerId: 'owner-a' }], LastEvaluatedKey: { id: 'page-marker' } }
                : { Items: [{ profOwnerId: 'owner-b' }] };
        },
        async chargeProfile() { return 'charged'; }
    };
    const counts = await processMonthlyDues({ amount: 50, now, dependencies });
    assert.equal(counts.charged, 2);
    assert.deepEqual(keys, [null, { id: 'page-marker' }]);
});

test('DynamoDB update is atomic, conditional, and duplicate-safe', async () => {
    let updateParams;
    const client = {
        scan: () => ({ promise: async () => ({ Items: [] }) }),
        update: params => {
            updateParams = params;
            return { promise: async () => {} };
        }
    };
    const dependencies = createDynamoDependencies(client, 'api', 'dev');
    assert.equal(await dependencies.chargeProfile('owner-a', 50, '2026-08', now.toISOString()), 'charged');
    assert.match(updateParams.UpdateExpression, /if_not_exists/);
    assert.match(updateParams.UpdateExpression, /lastMonthlyDuesPeriod/);
    assert.match(updateParams.ConditionExpression, /lastMonthlyDuesPeriod/);

    client.update = () => ({
        promise: async () => { throw Object.assign(new Error('duplicate'), { code: 'ConditionalCheckFailedException' }); }
    });
    assert.equal(await dependencies.chargeProfile('owner-a', 50, '2026-08', now.toISOString()), 'skipped');
});

test('legacy GraphQL parameters are declared only as unused Gen1 compatibility inputs', () => {
    const template = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'monthlyPropertyDues-cloudformation-template.json'),
        'utf8'
    ));
    const backendConfig = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', '..', '..', 'backend-config.json'),
        'utf8'
    ));
    const compatibilityParameters = [
        'apilexhoaGraphQLAPIEndpointOutput',
        'apilexhoaGraphQLAPIKeyOutput'
    ];

    for (const parameter of compatibilityParameters) {
        assert.deepEqual(template.Parameters[parameter], {
            Type: 'String',
            Default: parameter
        });
    }
    assert.deepEqual(
        backendConfig.function.monthlyPropertyDues.dependsOn[0].attributes,
        ['GraphQLAPIIdOutput', 'GraphQLAPIEndpointOutput', 'GraphQLAPIKeyOutput']
    );

    const environment = JSON.stringify(template.Resources.LambdaFunction.Properties.Environment);
    const iam = JSON.stringify(template.Resources.AmplifyResourcesPolicy);
    const source = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');
    for (const marker of ['GRAPHQLAPIENDPOINTOUTPUT', 'GRAPHQLAPIKEYOUTPUT']) {
        assert.equal(environment.includes(marker), false);
        assert.equal(iam.includes(marker), false);
        assert.equal(source.includes(marker), false);
    }
    assert.equal(iam.includes('appsync:GraphQL'), false);
});

test('invalid dues configuration fails closed', () => {
    for (const value of [undefined, '', 'zero', '0', '-1', 'Infinity']) {
        assert.throws(() => parseDuesAmount(value), /INVALID_DUES_CONFIGURATION/);
    }
});

test('handler logs only aggregate categories and no event or owner details', async () => {
    const oldAmount = process.env.DUES_AMOUNT;
    const oldError = console.error;
    const logs = [];
    process.env.DUES_AMOUNT = 'invalid';
    console.error = (...parts) => logs.push(parts);
    try {
        await assert.rejects(
            require('./index').handler({ profileId: 'sensitive-profile-marker', balance: 'sensitive-balance-marker' }),
            /INVALID_DUES_CONFIGURATION/
        );
    } finally {
        console.error = oldError;
        if (oldAmount === undefined) delete process.env.DUES_AMOUNT;
        else process.env.DUES_AMOUNT = oldAmount;
    }
    const serialized = JSON.stringify(logs);
    assert.equal(serialized.includes('sensitive-profile-marker'), false);
    assert.equal(serialized.includes('sensitive-balance-marker'), false);
    assert.equal(serialized.includes('EVENT'), false);
    assert.match(serialized, /INVALID_DUES_CONFIGURATION/);
});
