const AWS = require('aws-sdk');
const appsync = require('aws-appsync');
const gql = require('graphql-tag');

exports.handler = async (event) => {
  const graphqlClient = new appsync.AWSAppSyncClient({
    url: process.env.API_LEXHOA_GRAPHQLAPIENDPOINTOUTPUT,
    region: process.env.REGION,
    auth: {
      type: 'API_KEY',
      apiKey: process.env.API_LEXHOA_GRAPHQLAPIKEYOUTPUT,
    },
    disableOffline: true,
  });

  const mutation = gql`
    mutation CreateProfile($input: CreateProfileInput!) {
      createProfile(input: $input) {
        id
        cognitoID
        owner
      }
    }
  `;

  const variables = {
    input: {
      cognitoID: event.request.userAttributes.sub,
      owner: event.request.userAttributes.sub,
      name: event.request.userAttributes.name || '',
      email: event.request.userAttributes.email || ''
    }
  };

  try {
    await graphqlClient.mutate({ mutation, variables });
    return event;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};
