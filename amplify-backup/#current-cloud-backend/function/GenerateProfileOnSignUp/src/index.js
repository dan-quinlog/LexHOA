const AWS = require('aws-sdk');
const appsync = require('aws-appsync');
const gql = require('graphql-tag');

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
      id: event.request.userAttributes.sub,
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
