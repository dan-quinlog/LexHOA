const crypto = require('crypto');
const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();
const ALLOWED_GROUPS = new Set(['TREASURER', 'PRESIDENT']);
const INVOICE_TYPES = new Set(['DUES', 'ASSESSMENT', 'LATE_FEE', 'ADJUSTMENT']);
const ONLINE_METHODS = new Set(['CARD', 'BANK_ACCOUNT']);
const INVOICE_COUNTER_ID = 'INVOICE';
const MAX_WRITE_ATTEMPTS = 5;
const MAX_LINE_ITEMS = 50;
const MAX_TEXT_LENGTH = 500;
const GENERIC_ERROR = 'Unable to update the ledger';

// Validation and state errors whose messages are safe to show to the board.
class LedgerError extends Error {}

function groupsFrom(event) {
  const groups = event?.identity?.claims?.['cognito:groups'];
  if (Array.isArray(groups)) return groups;
  if (typeof groups !== 'string') return [];
  try {
    const parsed = JSON.parse(groups);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Cognito can also provide a comma-delimited claim.
  }
  return groups.split(',').map(group => group.trim()).filter(Boolean);
}

// The caller recorded in createdBy and voidedBy comes from the verified token, never from input.
function callerFrom(event) {
  if (!groupsFrom(event).some(group => ALLOWED_GROUPS.has(group))) {
    throw new LedgerError('Only the Treasurer or President can change the ledger');
  }
  const claims = event?.identity?.claims || {};
  const caller = claims.email || claims.sub || event?.identity?.username;
  if (!caller) throw new LedgerError('Only the Treasurer or President can change the ledger');
  return caller;
}

function text(value, label, { required = false } = {}) {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string') throw new LedgerError(`${label} must be text`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new LedgerError(`${label} is required`);
  if (trimmed.length > MAX_TEXT_LENGTH) throw new LedgerError(`${label} is too long`);
  return trimmed || undefined;
}

function toCents(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new LedgerError(`${label} must be a number`);
  }
  const cents = Math.round(value * 100);
  if (Math.abs(value * 100 - cents) > 1e-6) throw new LedgerError(`${label} must be in whole cents`);
  return cents;
}

function date(value, label) {
  const valid = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
  if (!valid) throw new LedgerError(`${label} must be a valid date`);
  return value;
}

function boolean(value, label) {
  if (typeof value !== 'boolean') throw new LedgerError(`${label} must be true or false`);
  return value;
}

function compact(item) {
  return Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined));
}

function invoiceNumber(seq) {
  return `INV-${String(seq).padStart(6, '0')}`;
}

function isCanceledTransaction(error) {
  return error?.code === 'TransactionCanceledException';
}

function profileOwner(profile) {
  return profile.owner || profile.cognitoID || undefined;
}

// Adds deltaCents to the profile balance, or only checks that the profile exists.
function balanceOperation(tables, profileId, deltaCents, timestamp) {
  if (deltaCents === 0) {
    return {
      ConditionCheck: {
        TableName: tables.Profile,
        Key: { id: profileId },
        ConditionExpression: 'attribute_exists(id)'
      }
    };
  }
  return {
    Update: {
      TableName: tables.Profile,
      Key: { id: profileId },
      UpdateExpression: 'SET #balance = if_not_exists(#balance, :zero) + :delta, updatedAt = :timestamp',
      ConditionExpression: 'attribute_exists(id)',
      ExpressionAttributeNames: { '#balance': 'balance' },
      ExpressionAttributeValues: { ':zero': 0, ':delta': deltaCents / 100, ':timestamp': timestamp }
    }
  };
}

async function getItem(client, TableName, id) {
  const result = await client.get({ TableName, Key: { id }, ConsistentRead: true }).promise();
  return result.Item;
}

async function requireProfile(client, tables, id) {
  const profileId = text(id, 'Owner ID', { required: true });
  const profile = await getItem(client, tables.Profile, profileId);
  if (!profile) throw new LedgerError('Owner profile not found');
  return profile;
}

async function issueInvoice(input, caller, { client, tables, now, newId }) {
  const type = input?.type;
  if (!INVOICE_TYPES.has(type)) throw new LedgerError('Invoice type is invalid');
  const description = text(input.description, 'Description', { required: type === 'ADJUSTMENT' });
  const dateApplied = date(input.dateApplied, 'Invoice date');
  const dateDue = date(input.dateDue, 'Due date');
  if (dateDue < dateApplied) throw new LedgerError('Due date cannot be before the invoice date');
  const balanceApplied = boolean(input.balanceApplied, 'Apply to balance');
  const billingPeriod = text(input.billingPeriod, 'Billing period');

  if (!Array.isArray(input.lineItems) || input.lineItems.length === 0) {
    throw new LedgerError('Add at least one line item');
  }
  if (input.lineItems.length > MAX_LINE_ITEMS) throw new LedgerError('Too many line items');

  const lineItems = [];
  let totalCents = 0;
  for (const [index, line] of input.lineItems.entries()) {
    const label = `Line ${index + 1}`;
    const amountCents = toCents(line?.amount, `${label} amount`);
    if (amountCents === 0) throw new LedgerError(`${label} amount cannot be zero`);
    if (amountCents < 0 && type !== 'ADJUSTMENT') {
      throw new LedgerError('Only adjustments can have negative amounts');
    }
    const propertyId = text(line.propertyId, `${label} property`);
    let address = text(line.address, `${label} address`);
    if (propertyId) {
      // Snapshot the stored address rather than trusting the client's copy.
      const property = await getItem(client, tables.Property, propertyId);
      if (!property) throw new LedgerError(`${label} property not found`);
      address = property.address;
    }
    const lineDescription = text(line.description, `${label} description`);
    if (!lineDescription && !address) throw new LedgerError(`${label} needs a description`);
    lineItems.push(compact({ propertyId, address, description: lineDescription, amount: amountCents / 100 }));
    totalCents += amountCents;
  }
  if (totalCents === 0) throw new LedgerError('Invoice total cannot be zero');

  const relatedInvoiceId = text(input.relatedInvoiceId, 'Related invoice');
  if (relatedInvoiceId && !(await getItem(client, tables.Invoice, relatedInvoiceId))) {
    throw new LedgerError('Related invoice not found');
  }

  const profile = await requireProfile(client, tables, input.ownerInvoicesId);
  const timestamp = now().toISOString();
  const invoice = compact({
    __typename: 'Invoice',
    id: newId(),
    type,
    status: 'ISSUED',
    billingPeriod,
    lineItems,
    totalAmount: totalCents / 100,
    balanceApplied,
    dateApplied,
    dateDue,
    description,
    relatedInvoiceId,
    createdBy: caller,
    owner: profileOwner(profile),
    ownerInvoicesId: profile.id,
    byTypeDateApplied: 'INVOICE',
    createdAt: timestamp,
    updatedAt: timestamp
  });

  // Same numbering transaction as the dues Lambda: a counter race cancels every write,
  // so retrying with a fresh read never skips or reuses a number.
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
    const counter = await getItem(client, tables.Counter, INVOICE_COUNTER_ID);
    const previousSeq = counter ? counter.seq : 0;
    invoice.invoiceNumber = invoiceNumber(previousSeq + 1);
    const counterValues = { ':next': previousSeq + 1, ':typename': 'Counter', ':timestamp': timestamp };
    if (previousSeq !== 0) counterValues[':previous'] = previousSeq;
    try {
      await client.transactWrite({
        TransactItems: [
          { Put: { TableName: tables.Invoice, Item: invoice, ConditionExpression: 'attribute_not_exists(id)' } },
          {
            Update: {
              TableName: tables.Counter,
              Key: { id: INVOICE_COUNTER_ID },
              UpdateExpression: 'SET #seq = :next, #typename = :typename, createdAt = if_not_exists(createdAt, :timestamp), updatedAt = :timestamp',
              ConditionExpression: previousSeq === 0 ? 'attribute_not_exists(#seq)' : '#seq = :previous',
              ExpressionAttributeNames: { '#seq': 'seq', '#typename': '__typename' },
              ExpressionAttributeValues: counterValues
            }
          },
          balanceOperation(tables, profile.id, balanceApplied ? totalCents : 0, timestamp)
        ]
      }).promise();
      return invoice;
    } catch (error) {
      if (!isCanceledTransaction(error)) throw error;
    }
  }
  throw new LedgerError('The invoice could not be numbered. Try again.');
}

async function voidInvoice(input, caller, { client, tables, now }) {
  const id = text(input?.id, 'Invoice ID', { required: true });
  const voidReason = text(input.reason, 'Void reason', { required: true });
  const invoice = await getItem(client, tables.Invoice, id);
  if (!invoice) throw new LedgerError('Invoice not found');
  if (invoice.status === 'VOID') throw new LedgerError('Invoice is already void');

  const voidedAt = now().toISOString();
  const totalCents = Math.round(invoice.totalAmount * 100);
  await client.transactWrite({
    TransactItems: [
      {
        Update: {
          TableName: tables.Invoice,
          Key: { id },
          UpdateExpression: 'SET #status = :void, voidedBy = :by, voidedAt = :at, voidReason = :reason, updatedAt = :at',
          ConditionExpression: '#status = :issued AND ownerInvoicesId = :owner',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: {
            ':void': 'VOID', ':issued': 'ISSUED', ':by': caller, ':at': voidedAt,
            ':reason': voidReason, ':owner': invoice.ownerInvoicesId
          }
        }
      },
      balanceOperation(tables, invoice.ownerInvoicesId, invoice.balanceApplied ? -totalCents : 0, voidedAt)
    ]
  }).promise();
  return { ...invoice, status: 'VOID', voidedBy: caller, voidedAt, voidReason, updatedAt: voidedAt };
}

async function recordManualPayment(input, caller, { client, tables, now, newId }) {
  const checkDate = date(input?.checkDate, 'Check date');
  const checkNumber = text(input.checkNumber, 'Check number', { required: true });
  const amountCents = toCents(input.checkAmount, 'Check amount');
  if (amountCents <= 0) throw new LedgerError('Check amount must be greater than zero');
  const invoiceNumberValue = text(input.invoiceNumber, 'Invoice number');
  let invoiceAmount;
  if (input.invoiceAmount !== undefined && input.invoiceAmount !== null) {
    const invoiceCents = toCents(input.invoiceAmount, 'Invoice amount');
    if (invoiceCents < 0) throw new LedgerError('Invoice amount cannot be negative');
    invoiceAmount = invoiceCents / 100;
  }
  const applyToBalance = boolean(input.applyToBalance, 'Apply to balance');
  const profile = await requireProfile(client, tables, input.ownerPaymentsId);

  const timestamp = now().toISOString();
  const amount = amountCents / 100;
  const payment = compact({
    __typename: 'Payment',
    id: newId(),
    checkDate,
    checkNumber,
    checkAmount: amount,
    invoiceNumber: invoiceNumberValue,
    invoiceAmount,
    paymentMethod: 'CHECK',
    amount,
    processingFee: 0,
    totalAmount: amount,
    status: 'SUCCEEDED',
    balanceApplied: applyToBalance,
    source: 'BOARD',
    createdBy: caller,
    owner: profileOwner(profile),
    ownerPaymentsId: profile.id,
    byTypeCreatedAt: 'PAYMENT',
    byTypeCheckDate: 'PAYMENT',
    byTypeInvoiceNumber: 'PAYMENT',
    createdAt: timestamp,
    updatedAt: timestamp
  });

  await client.transactWrite({
    TransactItems: [
      { Put: { TableName: tables.Payment, Item: payment, ConditionExpression: 'attribute_not_exists(id)' } },
      balanceOperation(tables, profile.id, applyToBalance ? -amountCents : 0, timestamp)
    ]
  }).promise();
  return payment;
}

async function voidPayment(input, caller, { client, tables, now }) {
  const id = text(input?.id, 'Payment ID', { required: true });
  const voidReason = text(input.reason, 'Void reason', { required: true });
  const payment = await getItem(client, tables.Payment, id);
  if (!payment) throw new LedgerError('Payment not found');
  // Payments without a source predate the field; processor fields identify online payments.
  if (payment.source === 'ONLINE' || payment.authNetTransactionId || ONLINE_METHODS.has(payment.paymentMethod)) {
    throw new LedgerError('Online payments are reversed through Authorize.Net, not voided');
  }
  if (payment.status === 'CANCELED' || payment.status === 'REFUNDED') {
    throw new LedgerError('Payment is already void');
  }

  const voidedAt = now().toISOString();
  const amountCents = Math.round(payment.amount * 100);
  await client.transactWrite({
    TransactItems: [
      {
        Update: {
          TableName: tables.Payment,
          Key: { id },
          UpdateExpression: 'SET #status = :canceled, voidedBy = :by, voidedAt = :at, voidReason = :reason, updatedAt = :at',
          ConditionExpression: 'attribute_exists(id) AND (attribute_not_exists(#status) OR NOT #status IN (:canceled, :refunded)) AND ownerPaymentsId = :owner',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: {
            ':canceled': 'CANCELED', ':refunded': 'REFUNDED', ':by': caller, ':at': voidedAt,
            ':reason': voidReason, ':owner': payment.ownerPaymentsId
          }
        }
      },
      // Only payments recorded as applied restore the balance; older manual entries never set the flag.
      balanceOperation(tables, payment.ownerPaymentsId, payment.balanceApplied === true ? amountCents : 0, voidedAt)
    ]
  }).promise();
  return { ...payment, status: 'CANCELED', voidedBy: caller, voidedAt, voidReason, updatedAt: voidedAt };
}

const OPERATIONS = { issueInvoice, voidInvoice, recordManualPayment, voidPayment };

function tablesFromEnvironment(environment) {
  const apiId = environment.API_ID;
  const env = environment.ENV;
  if (!apiId || !env) throw new Error('Ledger tables are not configured');
  const table = name => `${name}-${apiId}-${env}`;
  return {
    Profile: table('Profile'),
    Property: table('Property'),
    Invoice: table('Invoice'),
    Payment: table('Payment'),
    Counter: table('Counter')
  };
}

function createHandler({
  client = documentClient,
  tables,
  now = () => new Date(),
  newId = () => crypto.randomUUID()
} = {}) {
  return async event => {
    const operation = OPERATIONS[event?.fieldName];
    try {
      if (!operation) throw new Error('Unsupported ledger operation');
      const caller = callerFrom(event);
      return await operation(event.arguments?.input, caller, {
        client,
        tables: tables || tablesFromEnvironment(process.env),
        now,
        newId
      });
    } catch (error) {
      if (error instanceof LedgerError) throw error;
      if (isCanceledTransaction(error)) {
        throw new LedgerError('The record changed while saving. Refresh and try again.');
      }
      console.error('ledger_operation_failed', { operation: event?.fieldName, code: error?.code || error?.name });
      throw new Error(GENERIC_ERROR);
    }
  };
}

exports.handler = createHandler();
exports._internals = { createHandler, groupsFrom, invoiceNumber, tablesFromEnvironment };
