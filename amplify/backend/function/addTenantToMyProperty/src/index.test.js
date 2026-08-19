const test = require('node:test');
const assert = require('node:assert/strict');
const { addTenant, createHandler } = require('./index')._internals;

const TABLES = {
  profile: 'Profile-api-dev',
  property: 'Property-api-dev'
};

function event(input = {}, sub = 'trusted-sub') {
  return {
    identity: sub ? { claims: { sub } } : undefined,
    arguments: {
      input: {
        propertyId: 'property-1',
        name: 'Synthetic Tenant',
        email: 'tenant@example.invalid',
        ...input
      }
    }
  };
}

function clientWith({ gets = [], queryItems = [], transactError } = {}) {
  const getResults = [...gets];
  const calls = [];
  return {
    calls,
    get: request => ({
      promise: async () => {
        calls.push({ operation: 'get', request });
        return getResults.shift() || {};
      }
    }),
    query: request => ({
      promise: async () => {
        calls.push({ operation: 'query', request });
        return { Items: queryItems };
      }
    }),
    transactWrite: request => ({
      promise: async () => {
        calls.push({ operation: 'transactWrite', request });
        if (transactError) throw transactError;
        return {};
      }
    })
  };
}

const options = {
  now: () => new Date('2026-08-19T12:00:00.000Z'),
  randomUUID: () => 'tenant-generated-id'
};

test('denies an unauthenticated request before accessing DynamoDB', async () => {
  const client = clientWith();
  await assert.rejects(
    addTenant(event({}, null), client, TABLES.profile, TABLES.property),
    error => error.message === 'Unable to add tenant'
  );
  assert.equal(client.calls.length, 0);
});

test('requires the resolved caller profile to own the property', async () => {
  const client = clientWith({
    gets: [
      { Item: { id: 'owner-profile' } },
      { Item: { id: 'property-1', profOwnerId: 'different-profile' } }
    ]
  });

  await assert.rejects(
    addTenant(event(), client, TABLES.profile, TABLES.property),
    error => error.message === 'Unable to add tenant'
  );
  assert.deepEqual(client.calls.map(call => call.operation), ['get', 'get']);
});

test('denies a property that already has a tenant', async () => {
  const client = clientWith({
    gets: [
      { Item: { id: 'trusted-sub' } },
      { Item: { id: 'property-1', profOwnerId: 'trusted-sub', profTenantId: 'existing' } }
    ]
  });

  await assert.rejects(
    addTenant(event(), client, TABLES.profile, TABLES.property),
    error => error.message === 'Unable to add tenant'
  );
  assert.equal(client.calls.some(call => call.operation === 'transactWrite'), false);
});

test('resolves an existing non-sub profile and atomically writes only allowlisted tenant fields', async () => {
  const client = clientWith({
    gets: [
      {},
      { Item: { id: 'property-1', profOwnerId: 'legacy-profile' } }
    ],
    queryItems: [{ id: 'legacy-profile', cognitoID: 'trusted-sub' }]
  });

  const tenant = await addTenant(event({
    phone: '555-0100',
    contactPref: 'TEXT',
    allowText: true,
    owner: 'untrusted-owner',
    cognitoID: 'untrusted-cognito-id',
    balance: 999,
    billingFreq: 'ANNUAL',
    tenantAtId: 'untrusted-property',
    id: 'untrusted-id'
  }), client, TABLES.profile, TABLES.property, options);

  assert.deepEqual(client.calls.map(call => call.operation), ['get', 'query', 'get', 'transactWrite']);
  assert.equal(client.calls[1].request.IndexName, 'byCognitoID');
  assert.deepEqual(tenant, {
    id: 'tenant-generated-id',
    name: 'Synthetic Tenant',
    email: 'tenant@example.invalid',
    phone: '555-0100',
    contactPref: 'TEXT',
    allowText: true,
    owner: 'trusted-sub',
    byTypeName: 'PROFILE',
    byTypeBalance: 'PROFILE',
    byTypeCreatedAt: 'PROFILE',
    billingFreq: 'MONTHLY',
    balance: 0,
    tenantAtId: 'property-1',
    createdAt: '2026-08-19T12:00:00.000Z',
    updatedAt: '2026-08-19T12:00:00.000Z',
    __typename: 'Profile'
  });

  const transaction = client.calls[3].request;
  assert.equal(transaction.TransactItems.length, 2);
  assert.deepEqual(transaction.TransactItems[0].Put, {
    TableName: TABLES.profile,
    Item: tenant,
    ConditionExpression: 'attribute_not_exists(id)'
  });
  assert.equal(
    transaction.TransactItems[1].Update.ConditionExpression,
    '#owner = :ownerId AND attribute_not_exists(#tenant)'
  );
  assert.equal(transaction.TransactItems[1].Update.ExpressionAttributeValues[':ownerId'], 'legacy-profile');
  assert.equal(transaction.TransactItems[1].Update.ExpressionAttributeValues[':tenantId'], 'tenant-generated-id');
});

test('returns only a generic error when the atomic write loses a race or fails', async () => {
  const client = clientWith({
    gets: [
      { Item: { id: 'trusted-sub' } },
      { Item: { id: 'property-1', profOwnerId: 'trusted-sub' } }
    ],
    transactError: new Error('sensitive transaction detail')
  });

  await assert.rejects(
    createHandler(client, TABLES.profile, TABLES.property)(event()),
    error => error.message === 'Unable to add tenant'
  );
});
