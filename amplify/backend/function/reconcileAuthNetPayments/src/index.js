const AWS = require('aws-sdk');
const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const Constants = require('authorizenet').Constants;

const ddb = new AWS.DynamoDB.DocumentClient();
const suffix = () => `${process.env.API_LEXHOA_GRAPHQLAPIIDOUTPUT}-${process.env.ENV}`;
const tables = () => ({ payment: `Payment-${suffix()}`, profile: `Profile-${suffix()}` });
const FAILED = new Set(['declined', 'expired', 'generalError', 'failedReview', 'settlementError', 'voided', 'returnedItem', 'chargeback']);
const cents = value => Math.round(Number(value) * 100);
const rail = accountType => /echeck|bank/i.test(String(accountType || '')) ? 'BANK_ACCOUNT' : accountType ? 'CARD' : null;

async function scanPending(client = ddb) {
  const items = []; let ExclusiveStartKey;
  do {
    const page = await client.scan({ TableName: tables().payment, FilterExpression: '#s=:pending OR #s=:processing OR (#s=:succeeded AND paymentMethod=:bank)', ExpressionAttributeNames: { '#s': 'status' }, ExpressionAttributeValues: { ':pending': 'PENDING', ':processing': 'PROCESSING', ':succeeded': 'SUCCEEDED', ':bank': 'BANK_ACCOUNT' }, ExclusiveStartKey }).promise();
    items.push(...(page.Items || [])); ExclusiveStartKey = page.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

function details(transId) {
  return new Promise((resolve, reject) => {
    const auth = new ApiContracts.MerchantAuthenticationType(); auth.setName(process.env.AUTHNET_API_LOGIN_ID); auth.setTransactionKey(process.env.AUTHNET_TRANSACTION_KEY);
    const req = new ApiContracts.GetTransactionDetailsRequest(); req.setMerchantAuthentication(auth); req.setTransId(transId);
    const ctrl = new ApiControllers.GetTransactionDetailsController(req.getJSON()); ctrl.setEnvironment(process.env.AUTHNET_ENVIRONMENT === 'production' ? Constants.endpoint.production : Constants.endpoint.sandbox);
    ctrl.execute(() => { const res = new ApiContracts.GetTransactionDetailsResponse(ctrl.getResponse()); if (res?.getMessages().getResultCode() !== ApiContracts.MessageTypeEnum.OK) return reject(new Error('Processor verification failed')); const tx = res.getTransaction(); const returned = tx.getReturnedItems?.()?.getReturnedItem?.() || []; resolve({ status: tx.getTransactionStatus(), amount: Number(tx.getSettleAmount?.() || tx.getAuthAmount()), accountType: String(tx.getAccountType?.() || ''), returned: returned.length > 0 }); });
  });
}

async function transition(payment, succeeded, client = ddb) {
  if (succeeded && payment.balanceApplied) return false;
  const t = tables(); const profile = (await client.get({ TableName: t.profile, Key: { id: payment.ownerPaymentsId }, ConsistentRead: true }).promise()).Item;
  if (!profile) throw new Error('Payment profile missing');
  const now = new Date().toISOString();
  const profileUpdate = succeeded ? { UpdateExpression: 'SET balance=:new, updatedAt=:now REMOVE activePaymentId', ConditionExpression: 'activePaymentId=:pid AND balance=:old', ExpressionAttributeValues: { ':new': Math.max(0, (cents(profile.balance) - cents(payment.amount)) / 100), ':old': profile.balance, ':pid': payment.id, ':now': now } } : { UpdateExpression: 'SET updatedAt=:now REMOVE activePaymentId', ConditionExpression: 'activePaymentId=:pid', ExpressionAttributeValues: { ':pid': payment.id, ':now': now } };
  await client.transactWrite({ TransactItems: [
    { Update: { TableName: t.profile, Key: { id: profile.id }, ...profileUpdate } },
    { Update: { TableName: t.payment, Key: { id: payment.id }, UpdateExpression: 'SET #s=:next, balanceApplied=:applied, updatedAt=:now', ConditionExpression: '(#s=:pending OR #s=:processing) AND balanceApplied=:notApplied', ExpressionAttributeNames: { '#s': 'status' }, ExpressionAttributeValues: { ':next': succeeded ? 'SUCCEEDED' : 'FAILED', ':applied': succeeded, ':notApplied': false, ':pending': 'PENDING', ':processing': 'PROCESSING', ':now': now } } }
  ] }).promise(); return true;
}

async function reverseReturned(payment, client = ddb) {
  if (!payment.balanceApplied || payment.status !== 'SUCCEEDED') return false;
  const t = tables(); const profile = (await client.get({ TableName: t.profile, Key: { id: payment.ownerPaymentsId }, ConsistentRead: true }).promise()).Item;
  if (!profile) throw new Error('Payment profile missing');
  const now = new Date().toISOString();
  await client.transactWrite({ TransactItems: [
    { Update: { TableName: t.profile, Key: { id: profile.id }, UpdateExpression: 'SET balance=:new, updatedAt=:now', ConditionExpression: 'balance=:old AND attribute_not_exists(activePaymentId)', ExpressionAttributeValues: { ':new': (cents(profile.balance) + cents(payment.amount)) / 100, ':old': profile.balance, ':now': now } } },
    { Update: { TableName: t.payment, Key: { id: payment.id }, UpdateExpression: 'SET #s=:failed, balanceApplied=:no, updatedAt=:now', ConditionExpression: '#s=:succeeded AND balanceApplied=:yes', ExpressionAttributeNames: { '#s': 'status' }, ExpressionAttributeValues: { ':failed': 'FAILED', ':succeeded': 'SUCCEEDED', ':no': false, ':yes': true, ':now': now } } }
  ] }).promise(); return true;
}

async function reconcile(deps) {
  const summary = { checked: 0, settled: 0, failed: 0, stillPending: 0, errors: 0 };
  for (const payment of await deps.scan()) {
    summary.checked++;
    if (!payment.authNetTransactionId) { summary.errors++; console.warn(JSON.stringify({ code: 'missing_transaction_id', paymentId: payment.id })); continue; }
    try {
      const d = await deps.details(payment.authNetTransactionId); const actualRail = rail(d.accountType);
      if (!actualRail || actualRail !== payment.paymentMethod || cents(d.amount) !== cents(payment.totalAmount)) { summary.errors++; console.warn(JSON.stringify({ code: 'processor_mismatch', paymentId: payment.id })); continue; }
      if (actualRail === 'BANK_ACCOUNT' && d.returned) { if (await deps.reverseReturned(payment)) summary.failed++; continue; }
      const success = d.status === 'settledSuccessfully' || (actualRail === 'CARD' && d.status === 'capturedPendingSettlement');
      if (success) { if (await deps.transition(payment, true)) summary.settled++; }
      else if (FAILED.has(d.status)) { await deps.transition(payment, false); summary.failed++; }
      else summary.stillPending++;
    } catch (_) { summary.errors++; console.error(JSON.stringify({ code: 'payment_reconciliation_failed', paymentId: payment.id })); }
  }
  return { success: true, ...summary };
}
const defaultDeps = { scan: scanPending, details, transition, reverseReturned };
exports.handler = async () => reconcile(defaultDeps);
exports._internals = { reconcile, scanPending, details, transition, reverseReturned, rail, FAILED, tables };
