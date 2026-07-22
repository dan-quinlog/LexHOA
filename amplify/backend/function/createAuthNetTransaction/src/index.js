const crypto = require('crypto');
const AWS = require('aws-sdk');
const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const Constants = require('authorizenet').Constants;

const ddb = new AWS.DynamoDB.DocumentClient();
const tables = () => { const suffix = `${process.env.API_LEXHOA_GRAPHQLAPIIDOUTPUT}-${process.env.ENV}`; return { profile: `Profile-${suffix}`, payment: `Payment-${suffix}` }; };
const cents = value => Math.round(Number(value) * 100);
const paymentId = (subject, profileId, key) => crypto.createHash('sha256').update(`${subject}:${profileId}:${key}`).digest('hex');
const reference = id => `L${id.slice(0, 19)}`;
function fees(amount, method) { const fee = method === 'bank_account' ? Math.min(amount * .008, 5) : amount * .029 + .30; const processingFee = Math.round(fee * 100) / 100; return { processingFee, totalAmount: Math.round((amount + processingFee) * 100) / 100 }; }
const get = async (TableName, id, client = ddb) => (await client.get({ TableName, Key: { id }, ConsistentRead: true }).promise()).Item;

async function reserve(profile, payment, client = ddb) {
  const t = tables();
  await client.transactWrite({ TransactItems: [
    { Update: { TableName: t.profile, Key: { id: profile.id }, UpdateExpression: 'SET activePaymentId=:pid, updatedAt=:now', ConditionExpression: 'attribute_exists(id) AND balance=:balance AND attribute_not_exists(activePaymentId)', ExpressionAttributeValues: { ':pid': payment.id, ':balance': profile.balance, ':now': payment.updatedAt } } },
    { Put: { TableName: t.payment, Item: payment, ConditionExpression: 'attribute_not_exists(id)' } }
  ] }).promise();
}

async function finalize(payment, expectedStatus, nextStatus, applyBalance, client = ddb) {
  if (payment.balanceApplied || payment.status === 'SUCCEEDED') return payment;
  const t = tables(); const profile = await get(t.profile, payment.ownerPaymentsId, client);
  if (!profile) throw new Error('Profile missing during finalization');
  const now = new Date().toISOString(); const next = Math.max(0, (cents(profile.balance) - cents(payment.amount)) / 100);
  const paymentUpdate = applyBalance ? 'SET #s=:next, balanceApplied=:yes, updatedAt=:now' : 'SET #s=:next, updatedAt=:now';
  const profileValues = { ':pid': payment.id, ':old': profile.balance, ':now': now };
  const paymentValues = { ':next': nextStatus, ':expected': expectedStatus, ':no': false, ':now': now };
  if (applyBalance) { profileValues[':new'] = next; paymentValues[':yes'] = true; }
  await client.transactWrite({ TransactItems: [
    { Update: { TableName: t.profile, Key: { id: profile.id }, UpdateExpression: applyBalance ? 'SET balance=:new, updatedAt=:now REMOVE activePaymentId' : 'SET updatedAt=:now', ConditionExpression: 'activePaymentId=:pid AND balance=:old', ExpressionAttributeValues: profileValues } },
    { Update: { TableName: t.payment, Key: { id: payment.id }, UpdateExpression: paymentUpdate, ConditionExpression: '#s=:expected AND balanceApplied=:no', ExpressionAttributeNames: { '#s': 'status' }, ExpressionAttributeValues: paymentValues } }
  ] }).promise();
  return { ...payment, status: nextStatus, balanceApplied: applyBalance };
}

async function processPayment(event, deps) {
  const args = event.arguments || {}; const subject = event.identity?.claims?.sub || event.identity?.username;
  if (!subject) throw new Error('Unauthenticated');
  if (!args.profileId || !args.idempotencyKey || !args.opaqueDataDescriptor || !args.opaqueDataValue) throw new Error('Missing required parameters');
  const profile = await deps.getProfile(args.profileId);
  if (!profile || (profile.cognitoID || profile.id) !== subject) throw new Error('Profile access denied');
  const id = paymentId(subject, profile.id, args.idempotencyKey); let payment = await deps.getPayment(id); let won = false;
  if (payment && ['SUCCEEDED', 'PENDING'].includes(payment.status)) return result(payment);
  const amount = cents(profile.balance) / 100;
  if (!(amount > 0)) throw new Error('No positive balance due');
  if (cents(args.expectedAmount) !== cents(amount)) throw new Error('Balance changed; refresh payment amount');
  const requested = args.paymentMethodType === 'bank_account' ? 'BANK_ACCOUNT' : 'CARD';
  if (!payment) {
    const now = new Date().toISOString(); payment = { id, __typename: 'Payment', owner: subject, ownerPaymentsId: profile.id, idempotencyKey: args.idempotencyKey, processorReference: reference(id), amount, ...fees(amount, requested === 'BANK_ACCOUNT' ? 'bank_account' : 'card'), invoiceAmount: amount, paymentMethod: requested, status: 'PROCESSING', balanceApplied: false, description: 'HOA Dues Payment', byTypeCreatedAt: 'PAYMENT', createdAt: now, updatedAt: now };
    try { await deps.reserve(profile, payment); won = true; } catch (e) { payment = await deps.getPayment(id); if (!payment) throw new Error('Another payment is active for this profile'); }
  }
  if (['SUCCEEDED', 'PENDING'].includes(payment.status)) return result(payment);
  if (!payment.authNetTransactionId) {
    if (!won) throw new Error('Payment request is already processing');
    let captured;
    try {
      captured = await deps.capture({ amount: payment.totalAmount, descriptor: args.opaqueDataDescriptor, token: args.opaqueDataValue, reference: payment.processorReference, email: profile.email || '' });
    } catch (error) {
      if (error.definitive) await deps.fail(payment);
      throw error;
    }
    if (captured.paymentMethod !== payment.paymentMethod) throw new Error('Processor payment rail could not be verified');
    payment = await deps.attachTransaction(payment, captured.transactionId);
  }
  return result(await deps.finalize(payment, 'PROCESSING', payment.paymentMethod === 'CARD' ? 'SUCCEEDED' : 'PENDING', payment.paymentMethod === 'CARD'));
}

function result(p) { return { paymentId: p.id, transactionId: p.authNetTransactionId || '', status: p.status, settlementPending: p.status === 'PENDING', amount: p.amount, processingFee: p.processingFee, totalAmount: p.totalAmount, paymentMethodType: p.paymentMethod === 'BANK_ACCOUNT' ? 'bank_account' : 'card' }; }
async function attachTransaction(payment, transactionId, client = ddb) { const t = tables(); const now = new Date().toISOString(); await client.update({ TableName: t.payment, Key: { id: payment.id }, UpdateExpression: 'SET authNetTransactionId=:tx, updatedAt=:now', ConditionExpression: '#s=:processing AND attribute_not_exists(authNetTransactionId)', ExpressionAttributeNames: { '#s': 'status' }, ExpressionAttributeValues: { ':tx': transactionId, ':now': now, ':processing': 'PROCESSING' } }).promise(); return { ...payment, authNetTransactionId: transactionId, updatedAt: now }; }
async function failPayment(payment, client = ddb) { const t = tables(); const now = new Date().toISOString(); await client.transactWrite({ TransactItems: [
  { Update: { TableName: t.profile, Key: { id: payment.ownerPaymentsId }, UpdateExpression: 'SET updatedAt=:now REMOVE activePaymentId', ConditionExpression: 'activePaymentId=:pid', ExpressionAttributeValues: { ':pid': payment.id, ':now': now } } },
  { Update: { TableName: t.payment, Key: { id: payment.id }, UpdateExpression: 'SET #s=:failed, updatedAt=:now', ConditionExpression: '#s=:processing AND attribute_not_exists(authNetTransactionId)', ExpressionAttributeNames: { '#s': 'status' }, ExpressionAttributeValues: { ':processing': 'PROCESSING', ':failed': 'FAILED', ':now': now } } }
] }).promise(); }
function captureTransaction(data) { return new Promise((resolve, reject) => { const auth = new ApiContracts.MerchantAuthenticationType(); auth.setName(process.env.AUTHNET_API_LOGIN_ID); auth.setTransactionKey(process.env.AUTHNET_TRANSACTION_KEY); const opaque = new ApiContracts.OpaqueDataType(); opaque.setDataDescriptor(data.descriptor); opaque.setDataValue(data.token); const pay = new ApiContracts.PaymentType(); pay.setOpaqueData(opaque); const order = new ApiContracts.OrderType(); order.setInvoiceNumber(data.reference); const txr = new ApiContracts.TransactionRequestType(); txr.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION); txr.setPayment(pay); txr.setAmount(data.amount); txr.setOrder(order); const req = new ApiContracts.CreateTransactionRequest(); req.setRefId(data.reference); req.setMerchantAuthentication(auth); req.setTransactionRequest(txr); const ctrl = new ApiControllers.CreateTransactionController(req.getJSON()); ctrl.setEnvironment(process.env.AUTHNET_ENVIRONMENT === 'production' ? Constants.endpoint.production : Constants.endpoint.sandbox); ctrl.execute(() => { const raw = ctrl.getResponse(); const res = raw && new ApiContracts.CreateTransactionResponse(raw); const tx = res?.getTransactionResponse(); const accountType = String(tx?.getAccountType?.() || '').toLowerCase(); const rail = accountType.includes('echeck') || accountType.includes('bank') ? 'BANK_ACCOUNT' : accountType ? 'CARD' : null; if (res?.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK && String(tx?.getResponseCode?.()) === '1' && tx?.getTransId() && rail) return resolve({ transactionId: tx.getTransId(), paymentMethod: rail }); const error = new Error('Payment processor declined or rail was unverifiable'); error.definitive = Boolean(res); reject(error); }); }); }
const defaultDeps = { getProfile: id => get(tables().profile, id), getPayment: id => get(tables().payment, id), reserve, attachTransaction, finalize, fail: failPayment, capture: captureTransaction };
exports.handler = async event => processPayment(event, defaultDeps);
exports._internals = { processPayment, paymentId, reference, fees, reserve, finalize, failPayment, result };
