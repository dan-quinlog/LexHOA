const test = require('node:test');
const assert = require('node:assert/strict');
const { reconcile, transition } = require('./index')._internals;
const payment = (overrides = {}) => ({ id: 'p1', ownerPaymentsId: 'u1', status: 'PROCESSING', paymentMethod: 'CARD', amount: 100, totalAmount: 103.2, balanceApplied: false, authNetTransactionId: 'private', ...overrides });
const run = (p, d, apply = async () => true) => reconcile({ scan: async () => [p], details: async () => d, transition: apply });

test('verified card captured applies; ACH stays pending until settled', async () => {
  let calls = 0;
  assert.equal((await run(payment(), { status: 'capturedPendingSettlement', amount: 103.2, accountType: 'Visa' }, async (_, ok) => { calls++; assert.equal(ok, true); return true; })).settled, 1);
  const ach = payment({ paymentMethod: 'BANK_ACCOUNT', status: 'PENDING' });
  assert.equal((await run(ach, { status: 'capturedPendingSettlement', amount: 103.2, accountType: 'eCheck' })).stillPending, 1);
  assert.equal((await run(ach, { status: 'settledSuccessfully', amount: 103.2, accountType: 'eCheck' }, async () => true)).settled, 1);
  assert.equal(calls, 1);
});
test('amount and rail mismatches fail closed', async () => {
  assert.equal((await run(payment(), { status: 'settledSuccessfully', amount: 2, accountType: 'Visa' })).errors, 1);
  assert.equal((await run(payment(), { status: 'settledSuccessfully', amount: 103.2, accountType: 'eCheck' })).errors, 1);
});
test('already applied payment is a no-op', async () => {
  let called = false; const out = await run(payment({ balanceApplied: true }), { status: 'settledSuccessfully', amount: 103.2, accountType: 'Visa' }, async () => { called = true; return false; });
  assert.equal(out.settled, 0); assert.equal(called, true);
});
test('successful transition is one atomic profile/payment request', async () => {
  process.env.API_LEXHOA_GRAPHQLAPIIDOUTPUT = 'api'; process.env.ENV = 'test'; let request;
  const client = { get: () => ({ promise: async () => ({ Item: { id: 'u1', balance: 100, activePaymentId: 'p1' } }) }), transactWrite: p => ({ promise: async () => { request = p; } }) };
  await transition(payment(), true, client);
  assert.equal(request.TransactItems.length, 2); assert.match(request.TransactItems[0].Update.UpdateExpression, /REMOVE activePaymentId/); assert.match(request.TransactItems[1].Update.ConditionExpression, /balanceApplied/);
});
