const test = require('node:test');
const assert = require('node:assert/strict');
const template = require('../addTenantToMyProperty-cloudformation-template.json');

const statements = template.Resources.DynamoDBPolicy.Properties.PolicyDocument.Statement;
const statementFor = action => statements.find(statement => statement.Action.includes(action));

test('permits only transaction-enclosed writes on exact model tables', () => {
  const put = statementFor('dynamodb:PutItem');
  const update = statementFor('dynamodb:UpdateItem');
  const condition = { StringEquals: { 'dynamodb:EnclosingOperation': 'TransactWriteItems' } };

  assert.deepEqual(put.Action, ['dynamodb:PutItem']);
  assert.match(put.Resource['Fn::Sub'], /:table\/Profile-/);
  assert.deepEqual(put.Condition, condition);
  assert.deepEqual(update.Action, ['dynamodb:UpdateItem']);
  assert.match(update.Resource['Fn::Sub'], /:table\/Property-/);
  assert.deepEqual(update.Condition, condition);
});

test('retains exact reads without broad or TransactWriteItems permissions', () => {
  const actions = statements.flatMap(statement => statement.Action);
  assert.deepEqual(actions, [
    'dynamodb:GetItem',
    'dynamodb:PutItem',
    'dynamodb:UpdateItem',
    'dynamodb:Query'
  ]);
  assert.equal(actions.includes('dynamodb:TransactWriteItems'), false);
  assert.equal(JSON.stringify(statements).includes('"*"'), false);
  assert.match(
    statementFor('dynamodb:Query').Resource['Fn::Sub'],
    /:table\/Profile-.*\/index\/byCognitoID$/
  );
});
