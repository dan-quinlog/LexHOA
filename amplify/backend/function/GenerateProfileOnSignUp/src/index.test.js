const test = require('node:test');
const assert = require('node:assert/strict');
const { ensureProfile } = require('./index')._internals;

const identityEvent = (claims = {}) => ({
  identity: { claims },
  arguments: {
    sub: 'untrusted-sub',
    name: 'Untrusted Name',
    email: 'untrusted@example.invalid'
  }
});

test('rejects a request without a trusted Cognito identity', async () => {
  let calls = 0;
  const client = {
    query: async () => { calls += 1; },
    mutate: async () => { calls += 1; }
  };

  await assert.rejects(ensureProfile({}, client), /Unauthorized/);
  assert.equal(calls, 0);
});

test('creates a profile using only trusted identity claims', async () => {
  const calls = [];
  const client = {
    query: async () => ({ data: { getProfile: null } }),
    mutate: async request => {
      calls.push(request.variables.input);
      return { data: { createProfile: request.variables.input } };
    }
  };

  const profile = await ensureProfile(identityEvent({
    sub: 'trusted-sub',
    name: 'Trusted Name',
    email: 'trusted@example.invalid'
  }), client);

  assert.deepEqual(calls[0], {
    id: 'trusted-sub',
    cognitoID: 'trusted-sub',
    owner: 'trusted-sub',
    name: 'Trusted Name',
    email: 'trusted@example.invalid'
  });
  assert.equal(profile.id, 'trusted-sub');
});

test('returns an existing profile without creating a duplicate', async () => {
  const existing = { id: 'trusted-sub', cognitoID: 'trusted-sub' };
  let mutations = 0;
  const profile = await ensureProfile(identityEvent({ sub: 'trusted-sub' }), {
    query: async () => ({ data: { getProfile: existing } }),
    mutate: async () => { mutations += 1; }
  });

  assert.equal(profile, existing);
  assert.equal(mutations, 0);
});

test('treats a concurrent same-id creation as an idempotent retry', async () => {
  const existing = { id: 'trusted-sub', cognitoID: 'trusted-sub' };
  let queries = 0;
  const profile = await ensureProfile(identityEvent({ sub: 'trusted-sub' }), {
    query: async () => ({
      data: { getProfile: ++queries === 1 ? null : existing }
    }),
    mutate: async () => { throw new Error('duplicate marker'); }
  });

  assert.equal(profile, existing);
  assert.equal(queries, 2);
});
