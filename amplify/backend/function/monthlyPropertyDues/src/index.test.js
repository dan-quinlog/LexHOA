const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
    createDynamoDependencies,
    parseDuesAmount,
    processMonthlyDues
} = require('./index')._internals;

const now = new Date('2026-11-01T06:00:00.000Z');

function canceled() {
    return Object.assign(new Error('Transaction cancelled'), { code: 'TransactionCanceledException' });
}

// In-memory store that enforces the same preconditions as the DynamoDB transaction.
function memoryStore(pages, { profiles = {}, failOnce, raceOnce } = {}) {
    const invoices = new Map();
    const balances = new Map(Object.entries(profiles).map(([id, profile]) => [id, profile.balance]));
    const failed = new Set();
    let counter = 0;
    let pageIndex = 0;
    let raced = false;

    return {
        dependencies: {
            async scanProperties() {
                return pages[Math.min(pageIndex++, pages.length - 1)];
            },
            async getProfile(id) { return profiles[id]; },
            async invoiceExists(id) { return invoices.has(id); },
            async readInvoiceCounter() { return counter; },
            async writeInvoice(invoice, previousSeq) {
                if (failOnce === invoice.ownerInvoicesId && !failed.has(failOnce)) {
                    failed.add(failOnce);
                    throw new Error('sensitive-owner-marker');
                }
                if (raceOnce && !raced) {
                    raced = true;
                    counter += 1; // another writer takes the next number first
                }
                if (invoices.has(invoice.id) || counter !== previousSeq || !profiles[invoice.ownerInvoicesId]) {
                    throw canceled();
                }
                invoices.set(invoice.id, invoice);
                counter = previousSeq + 1;
                const id = invoice.ownerInvoicesId;
                balances.set(id, (balances.get(id) || 0) + invoice.totalAmount);
            }
        },
        resetPages() { pageIndex = 0; },
        invoices,
        balances,
        get counter() { return counter; }
    };
}

const profiles = {
    'owner-a': { id: 'owner-a', cognitoID: 'sub-a', balance: 25 },
    'owner-b': { id: 'owner-b' }
};
const pages = [{
    Items: [
        { id: 'prop-2', address: '200 Pine St', profOwnerId: 'owner-a' },
        { id: 'prop-3', address: '300 Oak St', profOwnerId: 'owner-b' },
        { id: 'prop-1', address: '100 Elm St', profOwnerId: 'owner-a' },
        { id: 'prop-4', address: '400 Ash St', profOwnerId: '' },
        { id: 'prop-5' }
    ]
}];

test('creates one next-year dues invoice per owner with a line per property and charges the balance', async () => {
    const store = memoryStore(pages, { profiles });
    const counts = await processMonthlyDues({ amount: 1000, now, dependencies: store.dependencies });
    assert.deepEqual(counts, { owners: 2, charged: 2, skipped: 0, failed: 0 });

    const a = store.invoices.get('dues-2027-owner-a');
    assert.equal(a.invoiceNumber, 'INV-000001');
    assert.equal(a.type, 'DUES');
    assert.equal(a.status, 'ISSUED');
    assert.equal(a.billingPeriod, '2027');
    assert.equal(a.dateApplied, '2026-11-01');
    assert.equal(a.dateDue, '2027-12-31');
    assert.equal(a.totalAmount, 2000);
    assert.equal(a.balanceApplied, true);
    assert.equal(a.createdBy, 'SYSTEM');
    assert.equal(a.owner, 'sub-a');
    assert.deepEqual(a.lineItems.map(item => [item.propertyId, item.address, item.amount]), [
        ['prop-1', '100 Elm St', 1000],
        ['prop-2', '200 Pine St', 1000]
    ]);

    const b = store.invoices.get('dues-2027-owner-b');
    assert.equal(b.invoiceNumber, 'INV-000002');
    assert.equal(b.totalAmount, 1000);
    assert.equal('owner' in b, false);

    assert.equal(store.counter, 2);
    assert.equal(store.balances.get('owner-a'), 2025);
    assert.equal(store.balances.get('owner-b'), 1000);
});

test('rerunning the same billing year creates nothing and consumes no invoice numbers', async () => {
    const store = memoryStore(pages, { profiles });
    await processMonthlyDues({ amount: 1000, now, dependencies: store.dependencies });
    store.resetPages();
    const retry = await processMonthlyDues({
        amount: 1000,
        now: new Date('2026-12-31T12:00:00.000Z'),
        dependencies: store.dependencies
    });
    assert.deepEqual(retry, { owners: 2, charged: 0, skipped: 2, failed: 0 });
    assert.equal(store.counter, 2);
    assert.equal(store.balances.get('owner-a'), 2025);
});

test('partial retry finishes remaining owners without gaps in invoice numbers', async () => {
    const store = memoryStore(pages, { profiles, failOnce: 'owner-a' });
    await assert.rejects(
        processMonthlyDues({ amount: 1000, now, dependencies: store.dependencies }),
        /MONTHLY_DUES_PARTIAL_FAILURE/
    );
    assert.equal(store.invoices.get('dues-2027-owner-b').invoiceNumber, 'INV-000001');

    store.resetPages();
    const retry = await processMonthlyDues({ amount: 1000, now, dependencies: store.dependencies });
    assert.deepEqual(retry, { owners: 2, charged: 1, skipped: 1, failed: 0 });
    assert.equal(store.invoices.get('dues-2027-owner-a').invoiceNumber, 'INV-000002');
    assert.equal(store.balances.get('owner-a'), 2025);
    assert.equal(store.balances.get('owner-b'), 1000);
});

test('retries with the next number when another writer advances the counter', async () => {
    const store = memoryStore([{ Items: [{ id: 'prop-1', address: '100 Elm St', profOwnerId: 'owner-a' }] }], {
        profiles,
        raceOnce: true
    });
    const counts = await processMonthlyDues({ amount: 1000, now, dependencies: store.dependencies });
    assert.equal(counts.charged, 1);
    assert.equal(store.invoices.get('dues-2027-owner-a').invoiceNumber, 'INV-000002');
    assert.equal(store.counter, 2);
    assert.equal(store.balances.get('owner-a'), 1025);
});

test('skips properties whose owner profile no longer exists', async () => {
    const store = memoryStore([{ Items: [{ id: 'prop-9', address: '900 Gone St', profOwnerId: 'missing' }] }], { profiles });
    const counts = await processMonthlyDues({ amount: 1000, now, dependencies: store.dependencies });
    assert.deepEqual(counts, { owners: 1, charged: 0, skipped: 1, failed: 0 });
    assert.equal(store.counter, 0);
});

test('paginates the Property table', async () => {
    let page = 0;
    const keys = [];
    const store = memoryStore([], { profiles });
    const dependencies = {
        ...store.dependencies,
        async scanProperties(key) {
            keys.push(key || null);
            page += 1;
            return page === 1
                ? { Items: [{ id: 'prop-1', profOwnerId: 'owner-a' }], LastEvaluatedKey: { id: 'page-marker' } }
                : { Items: [{ id: 'prop-3', profOwnerId: 'owner-b' }] };
        }
    };
    const counts = await processMonthlyDues({ amount: 50, now, dependencies });
    assert.equal(counts.charged, 2);
    assert.deepEqual(keys, [null, { id: 'page-marker' }]);
});

test('DynamoDB write creates the invoice, advances the counter, and charges the balance atomically', async () => {
    const requests = [];
    const client = {
        get: () => ({ promise: async () => ({}) }),
        transactWrite: params => {
            requests.push(params);
            return { promise: async () => {} };
        }
    };
    const dependencies = createDynamoDependencies(client, 'api', 'dev');
    assert.equal(await dependencies.readInvoiceCounter(), 0);

    const invoice = { id: 'dues-2027-owner-a', ownerInvoicesId: 'owner-a', totalAmount: 2000, updatedAt: now.toISOString() };
    await dependencies.writeInvoice(invoice, 0);
    await dependencies.writeInvoice(invoice, 41);

    const [first, second] = requests.map(request => request.TransactItems);
    assert.equal(first.length, 3);
    assert.equal(first[0].Put.TableName, 'Invoice-api-dev');
    assert.equal(first[0].Put.ConditionExpression, 'attribute_not_exists(id)');
    assert.equal(first[1].Update.TableName, 'Counter-api-dev');
    assert.equal(first[1].Update.ConditionExpression, 'attribute_not_exists(#seq)');
    assert.equal(first[1].Update.ExpressionAttributeValues[':next'], 1);
    assert.equal(second[1].Update.ConditionExpression, '#seq = :previous');
    assert.equal(second[1].Update.ExpressionAttributeValues[':previous'], 41);
    assert.equal(second[1].Update.ExpressionAttributeValues[':next'], 42);
    assert.equal(first[2].Update.TableName, 'Profile-api-dev');
    assert.deepEqual(first[2].Update.Key, { id: 'owner-a' });
    assert.match(first[2].Update.UpdateExpression, /if_not_exists\(#balance, :zero\) \+ :total/);
    assert.equal(first[2].Update.ExpressionAttributeValues[':total'], 2000);
});

test('IAM allows only the reads and transaction writes the dues run needs', () => {
    const template = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'monthlyPropertyDues-cloudformation-template.json'),
        'utf8'
    ));
    const statements = template.Resources.AmplifyResourcesPolicy.Properties.PolicyDocument.Statement;
    const tablesFor = action => {
        const statement = statements.find(s => s.Action.includes(action));
        return [].concat(statement.Resource).map(resource => resource['Fn::Sub'].match(/table\/(\w+)-/)[1]);
    };
    assert.deepEqual(statements.flatMap(s => s.Action), [
        'dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:PutItem'
    ]);
    assert.deepEqual(tablesFor('dynamodb:Scan'), ['Property']);
    assert.deepEqual(tablesFor('dynamodb:GetItem'), ['Profile', 'Invoice', 'Counter']);
    assert.deepEqual(tablesFor('dynamodb:UpdateItem'), ['Profile', 'Counter']);
    assert.deepEqual(tablesFor('dynamodb:PutItem'), ['Invoice']);
    const transactionOnly = { StringEquals: { 'dynamodb:EnclosingOperation': 'TransactWriteItems' } };
    for (const action of ['dynamodb:UpdateItem', 'dynamodb:PutItem']) {
        assert.deepEqual(statements.find(s => s.Action.includes(action)).Condition, transactionOnly);
    }
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

test('schedule runs once per year on November 1', () => {
    const parameters = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'parameters.json'),
        'utf8'
    ));
    assert.equal(parameters.CloudWatchRule, 'cron(0 6 1 11 ? *)');
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
