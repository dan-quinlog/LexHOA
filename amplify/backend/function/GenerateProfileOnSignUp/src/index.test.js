const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler, ensureProfile } = require('./index')._internals;

const appsyncEvent = (claims = {}) => ({
  identity: { claims },
  arguments: {
    sub: 'untrusted-sub',
    name: 'Untrusted Name',
    email: 'untrusted@example.invalid'
  }
});

const confirmationEvent = (attributes = {}) => ({
  triggerSource: 'PostConfirmation_ConfirmSignUp',
  request: { userAttributes: attributes }
});

function clientWith({ get = [{ Item: undefined }], putError } = {}) {
  const gets = [...get];
  const calls = [];
  return {
    calls,
    get: request => ({
      promise: async () => {
        calls.push({ operation: 'get', request });
        return gets.shift() || {};
      }
    }),
    put: request => ({
      promise: async () => {
        calls.push({ operation: 'put', request });
        if (putError) throw putError;
        return {};
      }
    })
  };
}

test('rejects a request without trusted Cognito identity', async () => {
  const client = clientWith();
  await assert.rejects(ensureProfile({}, client, 'Profile-dev'), /Unable to initialize profile/);
  assert.equal(client.calls.length, 0);
});

test('AppSync creates a complete profile using only trusted claims', async () => {
  const client = clientWith();
  const profile = await ensureProfile(appsyncEvent({
    sub: 'trusted-sub',
    name: 'Trusted Name',
    email: 'trusted@example.invalid'
  }), client, 'Profile-dev', () => new Date('2026-08-19T12:00:00.000Z'));

  assert.deepEqual(profile, {
    id: 'trusted-sub',
    cognitoID: 'trusted-sub',
    owner: 'trusted-sub',
    name: 'Trusted Name',
    email: 'trusted@example.invalid',
    byTypeName: 'PROFILE',
    byTypeBalance: 'PROFILE',
    byTypeCreatedAt: 'PROFILE',
    contactPref: 'EMAIL',
    billingFreq: 'MONTHLY',
    allowText: false,
    balance: 0,
    createdAt: '2026-08-19T12:00:00.000Z',
    updatedAt: '2026-08-19T12:00:00.000Z',
    __typename: 'Profile'
  });
  assert.equal(client.calls[1].request.ConditionExpression, 'attribute_not_exists(id)');
  assert.equal(client.calls[1].request.TableName, 'Profile-dev');
});

test('Cognito PostConfirmation creates from user attributes and returns the event', async () => {
  const client = clientWith();
  const event = confirmationEvent({
    sub: 'confirmed-sub',
    name: 'Confirmed User',
    email: 'confirmed@example.invalid'
  });

  assert.equal(await createHandler(client, 'Profile-dev')(event), event);
  assert.equal(client.calls[1].request.Item.id, 'confirmed-sub');
});

test('returns an existing profile without writing', async () => {
  const existing = { id: 'trusted-sub', cognitoID: 'trusted-sub' };
  const client = clientWith({ get: [{ Item: existing }] });
  const profile = await ensureProfile(appsyncEvent({ sub: 'trusted-sub' }), client, 'Profile-dev');

  assert.equal(profile, existing);
  assert.deepEqual(client.calls.map(call => call.operation), ['get']);
});

test('returns the winning profile after a conditional-create race', async () => {
  const winner = { id: 'trusted-sub', cognitoID: 'trusted-sub' };
  const client = clientWith({
    get: [{}, { Item: winner }],
    putError: { code: 'ConditionalCheckFailedException' }
  });

  assert.equal(
    await ensureProfile(appsyncEvent({ sub: 'trusted-sub' }), client, 'Profile-dev'),
    winner
  );
  assert.deepEqual(client.calls.map(call => call.operation), ['get', 'put', 'get']);
});

test('surfaces only a generic error when DynamoDB fails', async () => {
  const client = clientWith({ putError: new Error('sensitive backend detail') });
  await assert.rejects(
    createHandler(client, 'Profile-dev')(appsyncEvent({ sub: 'trusted-sub' })),
    error => error.message === 'Unable to initialize profile'
  );
});
