const test = require('node:test');
const assert = require('node:assert/strict');
const template = require('../mergeProfiles-cloudformation-template.json');

const statements = template.Resources.DynamoDBPolicy.Properties.PolicyDocument.Statement;
const statementFor = action => statements.find(statement => statement.Action.includes(action));

test('allows only exact profile and relationship reads', () => {
  assert.match(statementFor('dynamodb:GetItem').Resource['Fn::Sub'], /:table\/Profile-/);
  const queryResources = statementFor('dynamodb:Query').Resource.map(resource => resource['Fn::Sub']);
  assert.equal(queryResources.length, 5);
  for (const index of ['byOwner', 'byTenant', 'byOwnerPayments', 'byCreator', 'byUploader']) {
    assert.equal(queryResources.some(resource => resource.endsWith(`/index/${index}`)), true);
  }
});

test('allows only transaction-enclosed updates and source-profile deletion', () => {
  const condition = { StringEquals: { 'dynamodb:EnclosingOperation': 'TransactWriteItems' } };
  const update = statementFor('dynamodb:UpdateItem');
  const remove = statementFor('dynamodb:DeleteItem');
  assert.deepEqual(update.Condition, condition);
  assert.equal(update.Resource.length, 5);
  assert.deepEqual(remove.Condition, condition);
  assert.match(remove.Resource['Fn::Sub'], /:table\/Profile-/);

  const actions = statements.flatMap(statement => statement.Action);
  assert.deepEqual(actions, [
    'dynamodb:GetItem',
    'dynamodb:Query',
    'dynamodb:UpdateItem',
    'dynamodb:DeleteItem'
  ]);
  assert.equal(JSON.stringify(statements).includes('"*"'), false);
});
