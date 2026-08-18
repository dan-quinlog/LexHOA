const test = require('node:test');
const assert = require('node:assert/strict');
const { listUsersInGroup } = require('./index')._internals;

const event = (groups, groupName = 'BOARD', field = 'listUsersInGroup') => ({
  identity: { claims: { 'cognito:groups': groups } },
  info: { fieldName: field },
  arguments: { groupName }
});

test('rejects callers without PRESIDENT before Cognito access', async () => {
  let calls = 0;
  await assert.rejects(
    listUsersInGroup(event(['BOARD']), { send: async () => { calls += 1; } }),
    /Access denied/
  );
  assert.equal(calls, 0);
});

test('rejects unsupported groups and operations before Cognito access', async () => {
  let calls = 0;
  const client = { send: async () => { calls += 1; } };
  await assert.rejects(listUsersInGroup(event(['PRESIDENT'], 'UNRECOGNIZED'), client), /Unsupported group/);
  await assert.rejects(listUsersInGroup(event(['PRESIDENT'], 'BOARD', 'otherField'), client), /Unsupported operation/);
  assert.equal(calls, 0);
});

test('authorized PRESIDENT receives only required directory fields', async () => {
  let command;
  const users = await listUsersInGroup(event('["PRESIDENT"]'), {
    send: async value => {
      command = value;
      return {
        Users: [{
          Username: 'synthetic-user',
          Enabled: true,
          UserStatus: 'CONFIRMED',
          UserCreateDate: new Date(),
          UserLastModifiedDate: new Date(),
          Attributes: [
            { Name: 'email', Value: 'synthetic@example.invalid' },
            { Name: 'name', Value: 'Sensitive Name' }
          ]
        }]
      };
    }
  });
  assert.equal(command.input.GroupName, 'BOARD');
  assert.deepEqual(Object.keys(users[0]).sort(), ['email', 'enabled', 'userStatus', 'username']);
  assert.equal(users[0].email, 'synthetic@example.invalid');
});

test('Cognito failures are redacted from logs and response', async () => {
  const marker = 'sensitive-directory-marker';
  const logs = [];
  const oldError = console.error;
  console.error = (...parts) => logs.push(parts);
  try {
    await assert.rejects(
      listUsersInGroup(event(['PRESIDENT']), { send: async () => { throw new Error(marker); } }),
      error => error.message === 'Unable to list users'
    );
  } finally {
    console.error = oldError;
  }
  assert.equal(JSON.stringify(logs).includes(marker), false);
});
