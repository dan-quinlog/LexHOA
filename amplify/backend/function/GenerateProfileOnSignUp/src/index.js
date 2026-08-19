const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();

function trustedAttributes(event) {
  if (event?.triggerSource?.startsWith('PostConfirmation_')) {
    return event.request?.userAttributes;
  }

  return event?.identity?.claims;
}

async function ensureProfile(event, client, tableName, now = () => new Date()) {
  const attributes = trustedAttributes(event);
  const sub = attributes?.sub;

  if (!sub) {
    throw new Error('Unable to initialize profile');
  }

  const key = { id: sub };
  const existing = await client.get({
    TableName: tableName,
    Key: key,
    ConsistentRead: true
  }).promise();

  if (existing.Item) {
    return existing.Item;
  }

  const timestamp = now().toISOString();
  const profile = {
    id: sub,
    cognitoID: sub,
    owner: sub,
    name: attributes.name || '',
    email: attributes.email || '',
    byTypeName: 'PROFILE',
    byTypeBalance: 'PROFILE',
    byTypeCreatedAt: 'PROFILE',
    contactPref: 'EMAIL',
    billingFreq: 'MONTHLY',
    allowText: false,
    balance: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    __typename: 'Profile'
  };

  try {
    await client.put({
      TableName: tableName,
      Item: profile,
      ConditionExpression: 'attribute_not_exists(id)'
    }).promise();
    return profile;
  } catch (error) {
    if (error?.code === 'ConditionalCheckFailedException') {
      const raced = await client.get({
        TableName: tableName,
        Key: key,
        ConsistentRead: true
      }).promise();
      if (raced.Item) {
        return raced.Item;
      }
    }

    throw new Error('Unable to initialize profile');
  }
}

function createHandler(client = documentClient, tableName = process.env.PROFILE_TABLE_NAME) {
  return async event => {
    try {
      const profile = await ensureProfile(event, client, tableName);
      return event?.triggerSource?.startsWith('PostConfirmation_') ? event : profile;
    } catch {
      throw new Error('Unable to initialize profile');
    }
  };
}

exports.handler = createHandler();
exports._internals = { createHandler, ensureProfile, trustedAttributes };
