const test = require('node:test'); const assert = require('node:assert/strict'); const crypto = require('crypto');
const mod = require('./index'); const { processEvent, verify, handle, transition, transactionAccountType } = mod._internals; const key = 'k'.repeat(128);
const sign = raw => `sha512=${crypto.createHmac('sha512', Buffer.from(key, 'utf8')).update(raw).digest('hex')}`;
const hook = (type = 'authcapture', id = 'event') => ({ notificationId: id, eventType: `net.authorize.payment.${type}.created`, payload: { id: 'tx' } });
function deps(payment, detail) { const calls = []; return { calls, received: async () => false, details: async () => detail, byTransaction: async id => id === payment.authNetTransactionId ? payment : null, byReference: async ref => ref === payment.processorReference ? payment : null, transition: async (...x) => calls.push(x) }; }
const runtime = { signatureKey: async () => key, process: async () => { throw new Error('Invalid webhook event'); } };
test('signature uses UTF-8 128-character key and supports base64 body', async () => { const raw = Buffer.from('{}'); assert.equal(verify(raw, sign(raw), key), true); const out = await handle({ body: raw.toString('base64'), isBase64Encoded: true, headers: { 'x-anet-signature': sign(raw) } }, runtime); assert.equal(out.statusCode, 400); });
test('missing invalid and malformed requests return 400', async () => { assert.equal((await handle({ body: '{}', headers: {} }, runtime)).statusCode, 400); assert.equal((await handle({ body: '{}', headers: { 'x-anet-signature': `sha512=${'0'.repeat(128)}` } }, runtime)).statusCode, 400); const raw = Buffer.from('{'); assert.equal((await handle({ body: '{', headers: { 'x-anet-signature': sign(raw) } }, runtime)).statusCode, 400); });
test('secret retrieval failures return 500 without processing', async () => { let processed = false; const out = await handle({ body: '{}', headers: {} }, { signatureKey: async () => { throw new Error('denied'); }, process: async () => { processed = true; } }); assert.equal(out.statusCode, 500); assert.equal(processed, false); });
test('unsupported event rejected', async () => { await assert.rejects(processEvent(hook('unknown'), deps({}, {}).calls), /Invalid/); });
test('authcapture recovers by merchant reference and ACH becomes pending', async () => { const p = { id: 'p', processorReference: 'ref', paymentMethod: 'BANK_ACCOUNT', totalAmount: 10, amount: 9, status: 'PROCESSING' }; const d = deps(p, { id: 'newtx', reference: 'ref', amount: 10, accountType: 'eCheck', status: 'capturedPendingSettlement' }); await processEvent(hook(), d); assert.equal(d.calls[0][1], 'PENDING'); assert.equal(d.calls[0][5], undefined); });
test('refund resolves refTransId and partial refund fails closed', async () => { const p = { id: 'p', authNetTransactionId: 'original', paymentMethod: 'CARD', totalAmount: 10, amount: 9, balanceApplied: true }; const d = deps(p, { id: 'refund', refTransId: 'original', amount: 10, accountType: 'Visa', status: 'refundSettledSuccessfully' }); await processEvent(hook('refund'), d); assert.equal(d.calls[0][1], 'REFUNDED'); d.details = async () => ({ id: 'refund', refTransId: 'original', amount: 5, status: 'refundSettledSuccessfully' }); await assert.rejects(processEvent(hook('refund', 'event2'), d), /Partial/); });
test('duplicate receipt is a no-op', async () => { let queried = false; const d = { received: async () => true, details: async () => { queried = true; } }; await processEvent(hook(), d); assert.equal(queried, false); });
test('successful processor transition maps transaction and invoice fields', async () => {
  process.env.API_LEXHOA_GRAPHQLAPIIDOUTPUT = 'api'; process.env.ENV = 'test';
  let request;
  const payment = { id: 'p', ownerPaymentsId: 'profile', amount: 25, balanceApplied: false };
  const client = {
    get: () => ({ promise: async () => ({ Item: { id: 'profile', balance: 100, activePaymentId: 'p' } }) }),
    transactWrite: value => ({ promise: async () => { request = value; } })
  };
  await transition(payment, 'SUCCEEDED', 25, 'event', 'processor-transaction', client);
  const update = request.TransactItems[2].Update;
  assert.equal(update.ExpressionAttributeValues[':invoice'], 25);
  assert.match(update.UpdateExpression, /checkNumber=if_not_exists\(checkNumber,:tx\)/);
});
test('transaction rail falls back to masked payment details', () => {
  const payment = value => ({ getPayment: () => value });
  assert.equal(transactionAccountType(payment({ getBankAccount: () => ({}) })), 'eCheck');
  assert.equal(transactionAccountType(payment({ getBankAccount: () => undefined, getCreditCard: () => ({}) })), 'card');
});
