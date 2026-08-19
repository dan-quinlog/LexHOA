const test = require('node:test');
const assert = require('node:assert/strict');
const { merge, createHandler, groupsFrom } = require('./index')._internals;

const TABLES = {
  Profile: 'Profile-api-dev',
  Property: 'Property-api-dev',
  Payment: 'Payment-api-dev',
  Ping: 'Ping-api-dev',
  Document: 'Document-api-dev'
};
const FIELDS = [
  'name', 'email', 'phone', 'address', 'city', 'state', 'zip',
  'contactPref', 'billingFreq', 'allowText', 'balance'
];

function event(overrides = {}, groups = ['PRESIDENT']) {
  return {
    identity: { claims: { 'cognito:groups': groups } },
    arguments: {
      input: {
        cognitoProfileId: 'cognito-profile',
        manualProfileId: 'manual-profile',
        selections: Object.fromEntries(FIELDS.map(field => [field, 'COGNITO'])),
        ...overrides
      }
    }
  };
}

function clientWith({ profiles, queries = {}, transactionError } = {}) {
  const calls = [];
  return {
    calls,
    get: request => ({ promise: async () => {
      calls.push({ operation: 'get', request });
      return { Item: profiles?.[request.Key.id] };
    }}),
    query: request => ({ promise: async () => {
      calls.push({ operation: 'query', request });
      return queries[request.IndexName]?.shift() || { Items: [] };
    }}),
    transactWrite: request => ({ promise: async () => {
      calls.push({ operation: 'transactWrite', request });
      if (transactionError) throw transactionError;
      return {};
    }})
  };
}

const profiles = {
  'cognito-profile': {
    id: 'cognito-profile', cognitoID: 'trusted-sub', owner: 'trusted-sub',
    name: 'Cognito Name', email: 'cognito@example.invalid', contactPref: 'EMAIL',
    billingFreq: 'MONTHLY', allowText: false, balance: 10
  },
  'manual-profile': {
    id: 'manual-profile', name: 'Manual Name', email: 'manual@example.invalid',
    phone: '555-0100', contactPref: 'TEXT', billingFreq: 'ANNUAL',
    allowText: true, balance: 20, authNetCustomerProfileId: 'synthetic-customer-id'
  }
};
const options = { now: () => new Date('2026-08-19T12:00:00.000Z') };

test('accepts Cognito array and serialized group claims', () => {
  assert.deepEqual(groupsFrom(event()), ['PRESIDENT']);
  assert.deepEqual(groupsFrom(event({}, '["SECRETARY"]')), ['SECRETARY']);
});

test('rejects unauthorized callers before reading profiles', async () => {
  const client = clientWith({ profiles });
  await assert.rejects(merge(event({}, ['BOARD']), client, TABLES), /Unable to merge profiles/);
  assert.equal(client.calls.length, 0);
});

test('rejects two Cognito profiles or a missing field selection', async () => {
  const client = clientWith({ profiles: {
    ...profiles,
    'manual-profile': { ...profiles['manual-profile'], cognitoID: 'other-sub' }
  }});
  await assert.rejects(merge(event(), client, TABLES), /Unable to merge profiles/);

  const incomplete = event();
  delete incomplete.arguments.input.selections.email;
  const secondClient = clientWith({ profiles });
  await assert.rejects(merge(incomplete, secondClient, TABLES), /Unable to merge profiles/);
  assert.equal(secondClient.calls.length, 0);
});

test('atomically selects values, transfers every relationship, and deletes only the manual profile', async () => {
  const queries = {
    byOwner: [{ Items: [{ id: 'property-owned', profOwnerId: 'manual-profile' }] }],
    byTenant: [{ Items: [{ id: 'property-rented', profTenantId: 'manual-profile' }] }],
    byOwnerPayments: [
      { Items: [{ id: 'payment-1' }], LastEvaluatedKey: { id: 'payment-1' } },
      { Items: [{ id: 'payment-2' }] }
    ],
    byCreator: [{ Items: [{ id: 'ping-1' }] }],
    byUploader: [{ Items: [{ id: 'document-1' }] }]
  };
  const client = clientWith({ profiles, queries });
  const request = event({
    selections: Object.fromEntries(FIELDS.map(field => [
      field,
      ['name', 'email', 'phone', 'allowText', 'balance'].includes(field) ? 'MANUAL' : 'COGNITO'
    ]))
  });

  const result = await merge(request, client, TABLES, options);
  assert.equal(result.id, 'cognito-profile');
  assert.equal(result.cognitoID, 'trusted-sub');
  assert.equal(result.name, 'Manual Name');
  assert.equal(result.email, 'manual@example.invalid');
  assert.equal(result.balance, 20);
  assert.equal(result.authNetCustomerProfileId, 'synthetic-customer-id');

  const transaction = client.calls.find(call => call.operation === 'transactWrite').request.TransactItems;
  assert.equal(transaction.length, 8);
  assert.equal(transaction.filter(item => item.Delete).length, 1);
  assert.deepEqual(transaction.at(-1).Delete.Key, { id: 'manual-profile' });
  assert.match(transaction.at(-1).Delete.ConditionExpression, /attribute_not_exists/);

  const serialized = JSON.stringify(transaction);
  for (const id of ['property-owned', 'property-rented', 'payment-1', 'payment-2', 'ping-1', 'document-1']) {
    assert.match(serialized, new RegExp(id));
  }
  assert.equal(
    transaction.filter(item => item.Update?.TableName !== TABLES.Profile &&
      item.Update?.ExpressionAttributeValues &&
      Object.values(item.Update.ExpressionAttributeValues).includes('trusted-sub')).length,
    4
  );
  assert.equal(client.calls.filter(call => call.operation === 'query').length, 6);
});

test('rejects conflicting tenant or payment customer relationships before writing', async () => {
  const conflictProfiles = {
    'cognito-profile': {
      ...profiles['cognito-profile'], tenantAtId: 'property-1', authNetCustomerProfileId: 'customer-1'
    },
    'manual-profile': {
      ...profiles['manual-profile'], tenantAtId: 'property-2', authNetCustomerProfileId: 'customer-2'
    }
  };
  const client = clientWith({ profiles: conflictProfiles });
  await assert.rejects(merge(event(), client, TABLES, options), /Unable to merge profiles/);
  assert.equal(client.calls.some(call => call.operation === 'transactWrite'), false);
});

test('returns a generic error and cannot partially apply a failed transaction', async () => {
  const client = clientWith({
    profiles,
    transactionError: new Error('sensitive transaction detail')
  });
  await assert.rejects(
    createHandler(client, TABLES)(event()),
    error => error.message === 'Unable to merge profiles'
  );
  assert.equal(client.calls.filter(call => call.operation === 'transactWrite').length, 1);
});
