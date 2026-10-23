const test = require('node:test');
const assert = require('node:assert/strict');
const template = require('../manageLedger-cloudformation-template.json');

const statements = template.Resources.DynamoDBPolicy.Properties.PolicyDocument.Statement;
const tablesFor = action => statements
  .find(statement => statement.Action.includes(action))
  .Resource.map(resource => resource['Fn::Sub'].match(/:table\/(\w+)-/)[1]);

test('reads only the ledger tables by key', () => {
  assert.deepEqual(tablesFor('dynamodb:GetItem'), ['Profile', 'Property', 'Invoice', 'Payment', 'Counter']);
});

test('writes only inside transactions and only to ledger tables', () => {
  const condition = { StringEquals: { 'dynamodb:EnclosingOperation': 'TransactWriteItems' } };
  for (const statement of statements.filter(statement => !statement.Action.includes('dynamodb:GetItem'))) {
    assert.deepEqual(statement.Condition, condition);
  }
  assert.deepEqual(tablesFor('dynamodb:PutItem'), ['Invoice', 'Payment']);
  assert.deepEqual(tablesFor('dynamodb:UpdateItem'), ['Profile', 'Invoice', 'Payment', 'Counter']);
  assert.deepEqual(tablesFor('dynamodb:ConditionCheckItem'), ['Profile']);

  assert.deepEqual(statements.flatMap(statement => statement.Action), [
    'dynamodb:GetItem',
    'dynamodb:PutItem',
    'dynamodb:UpdateItem',
    'dynamodb:ConditionCheckItem'
  ]);
  assert.equal(JSON.stringify(statements).includes('"*"'), false);
});
