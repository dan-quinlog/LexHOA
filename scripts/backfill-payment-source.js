#!/usr/bin/env node
// Sets Payment.source on payments created before the field existed:
// Authorize.Net payments (card, bank account, or a processor transaction ID) become ONLINE
// and everything else BOARD. createdBy is left unset because the creator was never recorded.
//
// Dry run (default) only reads and prints counts:
//   AWS_PROFILE=nisan AWS_REGION=us-east-1 node scripts/backfill-payment-source.js --table Payment-<apiId>-<env>
// Add --apply to write. Each write is conditional on source still being absent, so reruns are safe.
// Running with --apply against a live environment is a data change and needs explicit approval.

const AWS = require('aws-sdk');

const ONLINE_METHODS = new Set(['CARD', 'BANK_ACCOUNT']);

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const sourceFor = payment =>
  ONLINE_METHODS.has(payment.paymentMethod) || payment.authNetTransactionId ? 'ONLINE' : 'BOARD';

async function main() {
  const table = argument('--table');
  const apply = process.argv.includes('--apply');
  if (!table || !/^Payment-[a-z0-9]+-[a-z]+$/.test(table)) {
    throw new Error('Pass --table Payment-<apiId>-<env>');
  }

  const client = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION || 'us-east-1' });
  const counts = { scanned: 0, alreadySet: 0, ONLINE: 0, BOARD: 0, written: 0, skippedByCondition: 0 };
  let ExclusiveStartKey;

  do {
    const page = await client.scan({
      TableName: table,
      ProjectionExpression: 'id, paymentMethod, authNetTransactionId, #source',
      ExpressionAttributeNames: { '#source': 'source' },
      ExclusiveStartKey
    }).promise();

    for (const payment of page.Items || []) {
      counts.scanned += 1;
      if (payment.source) {
        counts.alreadySet += 1;
        continue;
      }
      const source = sourceFor(payment);
      counts[source] += 1;
      if (!apply) continue;
      try {
        await client.update({
          TableName: table,
          Key: { id: payment.id },
          UpdateExpression: 'SET #source = :source',
          ConditionExpression: 'attribute_exists(id) AND attribute_not_exists(#source)',
          ExpressionAttributeNames: { '#source': 'source' },
          ExpressionAttributeValues: { ':source': source }
        }).promise();
        counts.written += 1;
      } catch (error) {
        if (error.code !== 'ConditionalCheckFailedException') throw error;
        counts.skippedByCondition += 1;
      }
    }
    ExclusiveStartKey = page.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  console.log(JSON.stringify({ table, mode: apply ? 'apply' : 'dry-run', ...counts }, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
