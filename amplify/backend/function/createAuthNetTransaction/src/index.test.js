const test = require('node:test'); const assert = require('node:assert/strict');
const { processPayment, attachTransaction, fees, finalize, getTransactionKey, processorErrorMessage } = require('./index')._internals;
const event = (x = {}) => ({ identity: { claims: { sub: 'user' } }, arguments: { profileId: 'profile', idempotencyKey: 'key', paymentMethodType: 'card', opaqueDataDescriptor: 'desc', opaqueDataValue: 'sensitive-token', expectedAmount: 100, ...x } });
function store(opts = {}) { let p; let captures = 0; return { deps: { getProfile: async () => ({ id: 'profile', cognitoID: opts.owner || 'user', balance: 100 }), getPayment: async () => p, reserve: async (_, value) => { if (opts.reserveFail || p) throw Error('lost'); p = value; }, capture: async () => { captures++; return { transactionId: 'tx', paymentMethod: opts.rail || 'CARD' }; }, attachTransaction: async (value, tx) => p = { ...value, authNetTransactionId: tx }, finalize: async (value, _old, status, applied) => { if (opts.finalizeFail && !opts.failed) { opts.failed = true; throw Error('persist'); } return p = { ...value, status, balanceApplied: applied }; } }, stats: () => ({ p, captures }) }; }
test('authentication and profile ownership enforced', async () => { await assert.rejects(processPayment({ arguments: event().arguments }, store().deps), /Unauthenticated/); await assert.rejects(processPayment(event(), store({ owner: 'other' }).deps), /access denied/); });
test('accepts a partial payment and rejects invalid amounts', async () => { const s = store(); const out = await processPayment(event({ expectedAmount: 25 }), s.deps); assert.equal(out.amount, 25); await assert.rejects(processPayment(event({ expectedAmount: 101 }), store().deps), /exceeds/); await assert.rejects(processPayment(event({ expectedAmount: 0 }), store().deps), /greater than zero/); });
test('charges one percent for cards and no fee for eCheck', () => {
  assert.deepEqual(fees(100, 'card'), { processingFee: 1, totalAmount: 101 });
  assert.deepEqual(fees(100, 'bank_account'), { processingFee: 0, totalAmount: 100 });
  assert.deepEqual(fees(10.55, 'card'), { processingFee: 0.11, totalAmount: 10.66 });
});
test('same idempotency key charges once', async () => { const s = store(); await processPayment(event(), s.deps); await processPayment(event(), s.deps); assert.equal(s.stats().captures, 1); });
test('reservation loser never captures', async () => { const s = store({ reserveFail: true }); await assert.rejects(processPayment(event(), s.deps), /Another payment/); assert.equal(s.stats().captures, 0); });
test('processor rail mismatch fails closed', async () => { await assert.rejects(processPayment(event(), store({ rail: 'BANK_ACCOUNT' }).deps), /rail/); });
test('captured id survives and retry finalizes without recharge', async () => { const opts = { finalizeFail: true }; const s = store(opts); await assert.rejects(processPayment(event(), s.deps), /persist/); assert.equal(s.stats().p.authNetTransactionId, 'tx'); await processPayment(event(), s.deps); assert.equal(s.stats().captures, 1); });
test('processor fields distinguish attempted, accepted, and successful amounts', async () => {
  let reserved;
  const decline = new Error('declined'); decline.definitive = true;
  await assert.rejects(processPayment(event({ expectedAmount: 25 }), {
    getProfile: async () => ({ id: 'profile', cognitoID: 'user', balance: 100 }),
    getPayment: async () => null,
    reserve: async (_, payment) => { reserved = payment; },
    capture: async () => { throw decline; },
    fail: async () => {}
  }), /declined/);
  assert.equal(reserved.checkAmount, 25);
  assert.equal(reserved.invoiceAmount, 0);
  assert.equal(reserved.checkNumber, undefined);

  let update;
  const accepted = await attachTransaction(reserved, 'processor-transaction', {
    update: request => ({ promise: async () => { update = request; } })
  });
  assert.equal(accepted.checkNumber, 'processor-transaction');
  assert.match(update.UpdateExpression, /checkNumber=:tx/);

  let transaction;
  const succeeded = await finalize(accepted, 'PROCESSING', 'SUCCEEDED', true, {
    get: () => ({ promise: async () => ({ Item: { id: 'profile', balance: 100, activePaymentId: reserved.id } }) }),
    transactWrite: request => ({ promise: async () => { transaction = request; } })
  });
  assert.equal(succeeded.invoiceAmount, 25);
  assert.equal(transaction.TransactItems[1].Update.ExpressionAttributeValues[':invoice'], 25);
});
test('sensitive token is absent from logs', async () => { const logs = []; const old = console.error; console.error = x => logs.push(String(x)); try { await assert.rejects(processPayment({ arguments: event().arguments }, store().deps)); } finally { console.error = old; } assert.equal(logs.join('').includes('sensitive-token'), false); });
test('transaction key rotation is visible to a warm Lambda container', async () => {
  process.env.AUTHNET_TRANSACTION_SECRET_ID = 'transaction-secret';
  let version = 0;
  const client = { getSecretValue: () => ({ promise: async () => ({ SecretString: `key-${++version}` }) }) };
  assert.equal(await getTransactionKey(client), 'key-1');
  assert.equal(await getTransactionKey(client), 'key-2');
});
test('processor errors retain the safe response code and text', () => {
  const response = { getMessages: () => ({ getMessage: () => [{ getCode: () => 'E00027', getText: () => 'The transaction was unsuccessful.' }] }) };
  const transaction = { getErrors: () => ({ getError: () => [{ getErrorCode: () => '2', getErrorText: () => 'This transaction has been declined.' }] }) };
  assert.equal(processorErrorMessage(response, transaction), '2: This transaction has been declined.');
  assert.equal(processorErrorMessage(response), 'E00027: The transaction was unsuccessful.');
});
