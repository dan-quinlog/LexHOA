const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('./index')._internals;

const TABLES = {
  Profile: 'Profile-api-dev',
  Property: 'Property-api-dev',
  Invoice: 'Invoice-api-dev',
  Payment: 'Payment-api-dev',
  Counter: 'Counter-api-dev'
};
const NOW = new Date('2026-10-23T15:00:00.000Z');

function clientWith(items = {}, transactionErrors = []) {
  const transactions = [];
  return {
    transactions,
    get: request => ({ promise: async () => ({ Item: items[request.TableName]?.[request.Key.id] }) }),
    transactWrite: request => ({ promise: async () => {
      transactions.push(request.TransactItems);
      const error = transactionErrors.shift();
      if (error) throw error;
      return {};
    }})
  };
}

function run(client, fieldName, input, groups = ['TREASURER']) {
  let id = 0;
  const handler = createHandler({
    client,
    tables: TABLES,
    now: () => NOW,
    newId: () => `generated-${++id}`
  });
  return handler({
    fieldName,
    arguments: { input },
    identity: { claims: { sub: 'treasurer-sub', email: 'treasurer@example.invalid', 'cognito:groups': groups } }
  });
}

function canceled() {
  const error = new Error('Transaction cancelled');
  error.code = 'TransactionCanceledException';
  return error;
}

const balanceChange = items => {
  const update = items.find(item => item.Update?.TableName === TABLES.Profile)?.Update;
  return update ? update.ExpressionAttributeValues[':delta'] : 0;
};

const baseItems = () => ({
  [TABLES.Profile]: { 'owner-profile': { id: 'owner-profile', cognitoID: 'owner-sub', balance: 50 } },
  [TABLES.Property]: { 'property-1': { id: 'property-1', address: '101 Stored Address' } },
  [TABLES.Counter]: { INVOICE: { id: 'INVOICE', seq: 41 } }
});

const invoiceInput = overrides => ({
  ownerInvoicesId: 'owner-profile',
  type: 'ASSESSMENT',
  billingPeriod: '2027',
  lineItems: [
    { propertyId: 'property-1', address: 'Client supplied address', description: 'Roof', amount: 0.1 },
    { description: 'Gutters', amount: 0.2 }
  ],
  balanceApplied: true,
  dateApplied: '2026-10-23',
  dateDue: '2026-12-31',
  description: 'Special assessment',
  createdBy: 'forged@example.invalid',
  ...overrides
});

test('creates a numbered invoice, snapshots property addresses, and charges the balance in cents', async () => {
  const client = clientWith(baseItems());
  const invoice = await run(client, 'issueInvoice', invoiceInput());

  assert.equal(invoice.invoiceNumber, 'INV-000042');
  assert.equal(invoice.totalAmount, 0.3);
  assert.equal(invoice.createdBy, 'treasurer@example.invalid');
  assert.equal(invoice.owner, 'owner-sub');
  assert.equal(invoice.status, 'ISSUED');
  assert.deepEqual(invoice.lineItems, [
    { propertyId: 'property-1', address: '101 Stored Address', description: 'Roof', amount: 0.1 },
    { description: 'Gutters', amount: 0.2 }
  ]);

  const [items] = client.transactions;
  assert.equal(items[0].Put.Item, invoice);
  assert.equal(items[1].Update.ConditionExpression, '#seq = :previous');
  assert.equal(items[1].Update.ExpressionAttributeValues[':previous'], 41);
  assert.equal(items[1].Update.ExpressionAttributeValues[':next'], 42);
  assert.equal(balanceChange(items), 0.3);
});

test('record-only invoices leave the balance alone but still require the owner profile', async () => {
  const client = clientWith(baseItems());
  await run(client, 'issueInvoice', invoiceInput({ balanceApplied: false }));

  const [items] = client.transactions;
  assert.equal(balanceChange(items), 0);
  assert.deepEqual(items[2].ConditionCheck, {
    TableName: TABLES.Profile,
    Key: { id: 'owner-profile' },
    ConditionExpression: 'attribute_exists(id)'
  });
});

test('retries a counter race with the next number instead of reusing one', async () => {
  const items = baseItems();
  const client = clientWith(items, [canceled()]);
  const originalTransactWrite = client.transactWrite;
  client.transactWrite = request => {
    // Another writer takes INV-000042 between this Lambda's read and write.
    items[TABLES.Counter].INVOICE = { id: 'INVOICE', seq: 42 };
    return originalTransactWrite(request);
  };

  const invoice = await run(client, 'issueInvoice', invoiceInput());

  assert.equal(client.transactions.length, 2);
  assert.equal(client.transactions[1][1].Update.ExpressionAttributeValues[':previous'], 42);
  assert.equal(invoice.invoiceNumber, 'INV-000043');
});

test('only adjustments may be negative, and adjustments need a description', async () => {
  const negativeLine = [{ description: 'Seller credit', amount: -250 }];

  await assert.rejects(
    run(clientWith(baseItems()), 'issueInvoice', invoiceInput({ type: 'LATE_FEE', lineItems: negativeLine })),
    /Only adjustments can have negative amounts/
  );
  await assert.rejects(
    run(clientWith(baseItems()), 'issueInvoice', invoiceInput({ type: 'ADJUSTMENT', lineItems: negativeLine, description: ' ' })),
    /Description is required/
  );

  const client = clientWith(baseItems());
  const credit = await run(client, 'issueInvoice', invoiceInput({ type: 'ADJUSTMENT', lineItems: negativeLine }));
  assert.equal(credit.totalAmount, -250);
  assert.equal(balanceChange(client.transactions[0]), -250);
});

test('rejects due dates before the invoice date and amounts below a cent', async () => {
  await assert.rejects(
    run(clientWith(baseItems()), 'issueInvoice', invoiceInput({ dateDue: '2026-10-22' })),
    /Due date cannot be before the invoice date/
  );
  await assert.rejects(
    run(clientWith(baseItems()), 'issueInvoice', invoiceInput({ lineItems: [{ description: 'Fee', amount: 10.005 }] })),
    /whole cents/
  );
});

test('voiding an applied invoice reverses its balance change once', async () => {
  const items = baseItems();
  items[TABLES.Invoice] = {
    'invoice-1': { id: 'invoice-1', status: 'ISSUED', balanceApplied: true, totalAmount: 1000, ownerInvoicesId: 'owner-profile' },
    'invoice-2': { id: 'invoice-2', status: 'VOID', balanceApplied: true, totalAmount: 1000, ownerInvoicesId: 'owner-profile' }
  };
  const client = clientWith(items);

  const voided = await run(client, 'voidInvoice', { id: 'invoice-1', reason: 'Billed in error' });

  assert.equal(voided.status, 'VOID');
  assert.equal(voided.voidedBy, 'treasurer@example.invalid');
  assert.equal(voided.voidReason, 'Billed in error');
  const [transaction] = client.transactions;
  assert.match(transaction[0].Update.ConditionExpression, /#status = :issued/);
  assert.equal(balanceChange(transaction), -1000);

  await assert.rejects(run(client, 'voidInvoice', { id: 'invoice-2', reason: 'Again' }), /already void/);
  await assert.rejects(run(client, 'voidInvoice', { id: 'invoice-1', reason: '' }), /Void reason is required/);
});

test('records a manual payment and its balance change in one transaction', async () => {
  const client = clientWith(baseItems());
  const payment = await run(client, 'recordManualPayment', {
    ownerPaymentsId: 'owner-profile',
    checkDate: '2026-10-21',
    checkNumber: '1001',
    checkAmount: 1000,
    invoiceNumber: 'INV-000002',
    invoiceAmount: 1000,
    applyToBalance: true
  });

  assert.equal(payment.source, 'BOARD');
  assert.equal(payment.createdBy, 'treasurer@example.invalid');
  assert.equal(payment.status, 'SUCCEEDED');
  assert.equal(payment.balanceApplied, true);
  assert.equal(payment.owner, 'owner-sub');
  const [items] = client.transactions;
  assert.equal(items[0].Put.Item, payment);
  assert.equal(balanceChange(items), -1000);
});

test('voids board payments, restoring only balances that were applied', async () => {
  const items = baseItems();
  items[TABLES.Payment] = {
    applied: { id: 'applied', paymentMethod: 'CHECK', source: 'BOARD', status: 'SUCCEEDED', balanceApplied: true, amount: 125.5, ownerPaymentsId: 'owner-profile' },
    legacy: { id: 'legacy', paymentMethod: 'CHECK', status: 'SUCCEEDED', balanceApplied: false, amount: 80, ownerPaymentsId: 'owner-profile' },
    online: { id: 'online', paymentMethod: 'CARD', status: 'SUCCEEDED', balanceApplied: true, amount: 100, ownerPaymentsId: 'owner-profile' }
  };
  const client = clientWith(items);

  const voided = await run(client, 'voidPayment', { id: 'applied', reason: 'Check bounced' });
  assert.equal(voided.status, 'CANCELED');
  assert.equal(balanceChange(client.transactions[0]), 125.5);

  await run(client, 'voidPayment', { id: 'legacy', reason: 'Duplicate entry' });
  assert.equal(balanceChange(client.transactions[1]), 0);

  await assert.rejects(run(client, 'voidPayment', { id: 'online', reason: 'Refund' }), /reversed through Authorize\.Net/);
  assert.equal(client.transactions.length, 2);
});

test('rejects callers outside the Treasurer and President groups before reading data', async () => {
  const client = clientWith(baseItems());
  client.get = () => { throw new Error('should not read'); };
  await assert.rejects(run(client, 'issueInvoice', invoiceInput(), ['BOARD']), /Treasurer or President/);
  assert.equal(client.transactions.length, 0);
});

test('reports a changed record instead of an internal error when a void races another write', async () => {
  const items = baseItems();
  items[TABLES.Invoice] = {
    'invoice-1': { id: 'invoice-1', status: 'ISSUED', balanceApplied: true, totalAmount: 10, ownerInvoicesId: 'owner-profile' }
  };
  await assert.rejects(
    run(clientWith(items, [canceled()]), 'voidInvoice', { id: 'invoice-1', reason: 'Duplicate' }),
    /record changed while saving/
  );
});
