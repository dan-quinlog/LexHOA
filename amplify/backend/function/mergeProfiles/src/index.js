const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();
const ERROR_MESSAGE = 'Unable to merge profiles';
const ALLOWED_GROUPS = new Set(['PRESIDENT', 'SECRETARY']);
const MERGE_FIELDS = [
  'name',
  'email',
  'phone',
  'address',
  'city',
  'state',
  'zip',
  'contactPref',
  'billingFreq',
  'allowText',
  'balance'
];
const VALUE_SOURCES = new Set(['COGNITO', 'MANUAL']);
const MAX_TRANSACTION_ITEMS = 100;

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

function validateInput(event) {
  if (!groupsFrom(event).some(group => ALLOWED_GROUPS.has(group))) {
    throw new Error(ERROR_MESSAGE);
  }

  const input = event?.arguments?.input;
  if (!input?.cognitoProfileId || !input?.manualProfileId ||
      input.cognitoProfileId === input.manualProfileId || !input.selections) {
    throw new Error(ERROR_MESSAGE);
  }

  for (const field of MERGE_FIELDS) {
    if (!VALUE_SOURCES.has(input.selections[field])) throw new Error(ERROR_MESSAGE);
  }

  return input;
}

async function queryAll(client, request) {
  const items = [];
  let ExclusiveStartKey;

  do {
    const result = await client.query({ ...request, ExclusiveStartKey }).promise();
    items.push(...(result.Items || []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return items;
}

function tableName(baseName, apiId, env) {
  return `${baseName}-${apiId}-${env}`;
}

function tablesFromEnvironment(environment) {
  const apiId = environment.API_ID;
  const env = environment.ENV;
  if (!apiId || !env) throw new Error(ERROR_MESSAGE);

  return {
    Profile: tableName('Profile', apiId, env),
    Property: tableName('Property', apiId, env),
    Payment: tableName('Payment', apiId, env),
    Ping: tableName('Ping', apiId, env),
    Document: tableName('Document', apiId, env)
  };
}

function updateOperation(table, id, changes, conditions = {}) {
  const names = { '#id': 'id' };
  const values = {};
  const setParts = [];
  const removeParts = [];
  let index = 0;

  for (const [field, value] of Object.entries(changes)) {
    const name = `#field${index}`;
    names[name] = field;
    if (value === undefined || value === null || value === '') {
      removeParts.push(name);
    } else {
      const placeholder = `:value${index}`;
      values[placeholder] = value;
      setParts.push(`${name} = ${placeholder}`);
    }
    index += 1;
  }

  const conditionParts = ['attribute_exists(#id)'];
  for (const [field, expected] of Object.entries(conditions)) {
    const name = `#condition${index}`;
    const placeholder = `:condition${index}`;
    names[name] = field;
    values[placeholder] = expected;
    conditionParts.push(`${name} = ${placeholder}`);
    index += 1;
  }

  const expression = [];
  if (setParts.length) expression.push(`SET ${setParts.join(', ')}`);
  if (removeParts.length) expression.push(`REMOVE ${removeParts.join(', ')}`);

  return {
    Update: {
      TableName: table,
      Key: { id },
      UpdateExpression: expression.join(' '),
      ConditionExpression: conditionParts.join(' AND '),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values
    }
  };
}

function mergedProfileChanges(cognitoProfile, manualProfile, selections, timestamp) {
  const changes = { updatedAt: timestamp };
  for (const field of MERGE_FIELDS) {
    changes[field] = selections[field] === 'MANUAL'
      ? manualProfile[field]
      : cognitoProfile[field];
  }

  if (typeof changes.name !== 'string' || !changes.name.trim()) {
    throw new Error(ERROR_MESSAGE);
  }

  if (cognitoProfile.tenantAtId && manualProfile.tenantAtId &&
      cognitoProfile.tenantAtId !== manualProfile.tenantAtId) {
    throw new Error(ERROR_MESSAGE);
  }
  changes.tenantAtId = cognitoProfile.tenantAtId || manualProfile.tenantAtId;

  if (cognitoProfile.authNetCustomerProfileId && manualProfile.authNetCustomerProfileId &&
      cognitoProfile.authNetCustomerProfileId !== manualProfile.authNetCustomerProfileId) {
    throw new Error(ERROR_MESSAGE);
  }
  changes.authNetCustomerProfileId = cognitoProfile.authNetCustomerProfileId ||
    manualProfile.authNetCustomerProfileId;

  return changes;
}

async function merge(event, client, tables, options = {}) {
  const input = validateInput(event);
  const [cognitoResult, manualResult] = await Promise.all([
    client.get({ TableName: tables.Profile, Key: { id: input.cognitoProfileId }, ConsistentRead: true }).promise(),
    client.get({ TableName: tables.Profile, Key: { id: input.manualProfileId }, ConsistentRead: true }).promise()
  ]);
  const cognitoProfile = cognitoResult.Item;
  const manualProfile = manualResult.Item;

  if (!cognitoProfile?.cognitoID || !manualProfile || manualProfile.cognitoID) {
    throw new Error(ERROR_MESSAGE);
  }

  const sourceId = manualProfile.id;
  const targetId = cognitoProfile.id;
  const query = (table, index, field) => queryAll(client, {
    TableName: table,
    IndexName: index,
    KeyConditionExpression: '#relationship = :sourceId',
    ExpressionAttributeNames: { '#relationship': field },
    ExpressionAttributeValues: { ':sourceId': sourceId }
  });

  const [ownedProperties, rentedProperties, payments, pings, documents] = await Promise.all([
    query(tables.Property, 'byOwner', 'profOwnerId'),
    query(tables.Property, 'byTenant', 'profTenantId'),
    query(tables.Payment, 'byOwnerPayments', 'ownerPaymentsId'),
    query(tables.Ping, 'byCreator', 'profCreatorId'),
    query(tables.Document, 'byUploader', 'uploadedById')
  ]);

  const timestamp = (options.now || (() => new Date()))().toISOString();
  const transaction = [];
  const properties = new Map();
  for (const property of ownedProperties) properties.set(property.id, { property, owner: true });
  for (const property of rentedProperties) {
    const existing = properties.get(property.id) || { property };
    properties.set(property.id, { ...existing, tenant: true });
  }

  for (const { property, owner, tenant } of properties.values()) {
    const changes = { updatedAt: timestamp };
    const conditions = {};
    if (owner) {
      changes.profOwnerId = targetId;
      changes.owner = cognitoProfile.owner || cognitoProfile.cognitoID;
      conditions.profOwnerId = sourceId;
    }
    if (tenant) {
      changes.profTenantId = targetId;
      conditions.profTenantId = sourceId;
    }
    transaction.push(updateOperation(tables.Property, property.id, changes, conditions));
  }

  const relationshipUpdates = [
    [payments, tables.Payment, 'ownerPaymentsId', true],
    [pings, tables.Ping, 'profCreatorId', false],
    [documents, tables.Document, 'uploadedById', true]
  ];
  for (const [items, table, field, transferOwner] of relationshipUpdates) {
    for (const item of items) {
      const changes = { [field]: targetId, updatedAt: timestamp };
      if (transferOwner) changes.owner = cognitoProfile.owner || cognitoProfile.cognitoID;
      transaction.push(updateOperation(
        table,
        item.id,
        changes,
        { [field]: sourceId }
      ));
    }
  }

  const profileChanges = mergedProfileChanges(
    cognitoProfile,
    manualProfile,
    input.selections,
    timestamp
  );
  transaction.push(updateOperation(
    tables.Profile,
    targetId,
    profileChanges,
    { cognitoID: cognitoProfile.cognitoID }
  ));
  transaction.push({
    Delete: {
      TableName: tables.Profile,
      Key: { id: sourceId },
      ConditionExpression: 'attribute_exists(#id) AND attribute_not_exists(#cognitoID)',
      ExpressionAttributeNames: { '#id': 'id', '#cognitoID': 'cognitoID' }
    }
  });

  if (transaction.length > MAX_TRANSACTION_ITEMS) throw new Error(ERROR_MESSAGE);
  await client.transactWrite({ TransactItems: transaction }).promise();

  const result = { ...cognitoProfile, ...profileChanges };
  for (const [field, value] of Object.entries(result)) {
    if (value === undefined || value === null || value === '') delete result[field];
  }
  return result;
}

function createHandler(
  client = documentClient,
  tables
) {
  return async event => {
    try {
      return await merge(event, client, tables || tablesFromEnvironment(process.env));
    } catch {
      throw new Error(ERROR_MESSAGE);
    }
  };
}

exports.handler = createHandler();
exports._internals = {
  createHandler,
  groupsFrom,
  merge,
  mergedProfileChanges,
  queryAll,
  tablesFromEnvironment,
  updateOperation,
  validateInput
};
