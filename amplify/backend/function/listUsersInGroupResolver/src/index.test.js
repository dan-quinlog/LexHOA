const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { listUsersInGroup } = require('./index')._internals;

const event = (groups, groupName = 'BOARD', field = 'listUsersInGroup') => ({
  identity: { claims: { 'cognito:groups': groups } },
  fieldName: field,
  arguments: { groupName }
});

test('rejects callers without a board role before Cognito access', async () => {
  let calls = 0;
  await assert.rejects(
    listUsersInGroup(event(['RESIDENT']), { send: async () => { calls += 1; } }),
    /Access denied/
  );
  assert.equal(calls, 0);
});

test('every board role can list every supported group', async () => {
  const groups = ['BOARD', 'MEDIA', 'TREASURER', 'SECRETARY', 'PRESIDENT'];
  const requestedGroups = [];
  const client = {
    send: async command => {
      requestedGroups.push(command.input.GroupName);
      return { Users: [] };
    }
  };

  for (const callerGroup of groups) {
    for (const requestedGroup of groups) {
      await listUsersInGroup(event([callerGroup], requestedGroup), client);
    }
  }

  assert.equal(requestedGroups.length, groups.length * groups.length);
  assert.deepEqual(new Set(requestedGroups), new Set(groups));
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

test('infrastructure passes caller identity and grants scoped directory access', () => {
  const template = require('../listUsersInGroupResolver-cloudformation-template.json');
  const environment = template.Resources.LambdaFunction.Properties.Environment.Variables;
  const policy = template.Resources.AmplifyResourcesPolicy.Properties.PolicyDocument.Statement[0];
  const request = fs.readFileSync(
    path.join(__dirname, '../../../api/lexhoa/resolvers/Query.listUsersInGroup.req.vtl'),
    'utf8'
  );

  assert.deepEqual(environment.AUTH_LEXHOA4FACA5B8_USERPOOLID, {
    Ref: 'authlexhoa4faca5b8UserPoolId'
  });
  assert.deepEqual(policy.Action, ['cognito-idp:ListUsersInGroup']);
  assert.match(JSON.stringify(policy.Resource), /authlexhoa4faca5b8UserPoolId/);
  assert.match(request, /context\.identity/);
  assert.match(request, /context\.info\.fieldName/);
});
