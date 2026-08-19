const AWS = require('aws-sdk');
const crypto = require('crypto');

const documentClient = new AWS.DynamoDB.DocumentClient();
const ERROR_MESSAGE = 'Unable to add tenant';
const CONTACT_PREFERENCES = new Set(['EMAIL', 'CALL', 'TEXT', 'PHYSICAL']);
const OPTIONAL_STRING_FIELDS = ['phone', 'address', 'city', 'state', 'zip'];

function tenantFields(input) {
  if (!input || typeof input.propertyId !== 'string' || !input.propertyId ||
      typeof input.name !== 'string' || !input.name.trim() ||
      typeof input.email !== 'string' || !input.email.trim()) {
    throw new Error(ERROR_MESSAGE);
  }

  if (input.contactPref !== undefined &&
      input.contactPref !== null &&
      !CONTACT_PREFERENCES.has(input.contactPref)) {
    throw new Error(ERROR_MESSAGE);
  }

  if (input.allowText !== undefined &&
      input.allowText !== null &&
      typeof input.allowText !== 'boolean') {
    throw new Error(ERROR_MESSAGE);
  }

  const fields = {
    name: input.name,
    email: input.email,
    contactPref: input.contactPref || 'EMAIL',
    allowText: input.allowText ?? false
  };

  for (const field of OPTIONAL_STRING_FIELDS) {
    if (typeof input[field] === 'string') fields[field] = input[field];
  }

  return fields;
}

async function resolveCallerProfile(client, tableName, sub) {
  const byId = await client.get({
    TableName: tableName,
    Key: { id: sub },
    ConsistentRead: true
  }).promise();

  if (byId.Item) return byId.Item;

  const byCognitoId = await client.query({
    TableName: tableName,
    IndexName: 'byCognitoID',
    KeyConditionExpression: 'cognitoID = :sub',
    ExpressionAttributeValues: { ':sub': sub },
    Limit: 1
  }).promise();

  return byCognitoId.Items?.[0];
}

async function addTenant(event, client, profileTableName, propertyTableName, options = {}) {
  const sub = event?.identity?.claims?.sub;
  if (!sub) throw new Error(ERROR_MESSAGE);

  const input = event?.arguments?.input;
  const editableFields = tenantFields(input);
  const callerProfile = await resolveCallerProfile(client, profileTableName, sub);
  if (!callerProfile?.id) throw new Error(ERROR_MESSAGE);

  const propertyResult = await client.get({
    TableName: propertyTableName,
    Key: { id: input.propertyId },
    ConsistentRead: true
  }).promise();
  const property = propertyResult.Item;

  if (!property || property.profOwnerId !== callerProfile.id || property.profTenantId) {
    throw new Error(ERROR_MESSAGE);
  }

  const timestamp = (options.now || (() => new Date()))().toISOString();
  const tenant = {
    id: (options.randomUUID || crypto.randomUUID)(),
    ...editableFields,
    owner: sub,
    byTypeName: 'PROFILE',
    byTypeBalance: 'PROFILE',
    byTypeCreatedAt: 'PROFILE',
    billingFreq: 'MONTHLY',
    balance: 0,
    tenantAtId: property.id,
    createdAt: timestamp,
    updatedAt: timestamp,
    __typename: 'Profile'
  };

  await client.transactWrite({
    TransactItems: [
      {
        Put: {
          TableName: profileTableName,
          Item: tenant,
          ConditionExpression: 'attribute_not_exists(id)'
        }
      },
      {
        Update: {
          TableName: propertyTableName,
          Key: { id: property.id },
          UpdateExpression: 'SET #tenant = :tenantId, #updatedAt = :updatedAt',
          ConditionExpression: '#owner = :ownerId AND attribute_not_exists(#tenant)',
          ExpressionAttributeNames: {
            '#owner': 'profOwnerId',
            '#tenant': 'profTenantId',
            '#updatedAt': 'updatedAt'
          },
          ExpressionAttributeValues: {
            ':ownerId': callerProfile.id,
            ':tenantId': tenant.id,
            ':updatedAt': timestamp
          }
        }
      }
    ]
  }).promise();

  return tenant;
}

function createHandler(
  client = documentClient,
  profileTableName = process.env.PROFILE_TABLE_NAME,
  propertyTableName = process.env.PROPERTY_TABLE_NAME
) {
  return async event => {
    try {
      return await addTenant(event, client, profileTableName, propertyTableName);
    } catch {
      throw new Error(ERROR_MESSAGE);
    }
  };
}

exports.handler = createHandler();
exports._internals = { addTenant, createHandler, resolveCallerProfile, tenantFields };
