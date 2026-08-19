const AWS = require('aws-sdk');
const appsync = require('aws-appsync');
const gql = require('graphql-tag');

const getProfile = gql`
  query GetProfile($id: ID!) {
    getProfile(id: $id) {
      id
      cognitoID
      owner
      name
      email
    }
  }
`;

const createProfile = gql`
  mutation CreateProfile($input: CreateProfileInput!) {
    createProfile(input: $input) {
      id
      cognitoID
      owner
      name
      email
    }
  }
`;

async function findProfile(graphqlClient, sub) {
  const result = await graphqlClient.query({
    query: getProfile,
    variables: { id: sub },
    fetchPolicy: 'network-only'
  });
  return result.data?.getProfile || null;
}

async function ensureProfile(event, graphqlClient) {
  const claims = event?.identity?.claims;
  const sub = claims?.sub;

  if (!sub) {
    throw new Error('Unauthorized');
  }

  const existingProfile = await findProfile(graphqlClient, sub);
  if (existingProfile) {
    return existingProfile;
  }

  const variables = {
    input: {
      id: sub,
      cognitoID: sub,
      owner: sub,
      name: claims.name || '',
      email: claims.email || ''
    }
  };

  try {
    const result = await graphqlClient.mutate({
      mutation: createProfile,
      variables
    });
    return result.data.createProfile;
  } catch {
    const profileCreatedByAnotherRequest = await findProfile(graphqlClient, sub);
    if (profileCreatedByAnotherRequest) {
      return profileCreatedByAnotherRequest;
    }
    throw new Error('Unable to ensure profile');
  }
}

exports.handler = async (event) => {
  const graphqlClient = new appsync.AWSAppSyncClient({
    url: process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT,
    region: process.env.REGION,
    auth: {
      type: 'AWS_IAM',
      credentials: AWS.config.credentials
    },
    disableOffline: true,
  });

  return ensureProfile(event, graphqlClient);
};

exports._internals = { ensureProfile };
