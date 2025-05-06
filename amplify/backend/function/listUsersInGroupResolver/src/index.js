const AWS = require('aws-sdk');

exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event));
  
  // Initialize Cognito Identity Provider
  const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
    region: process.env.REGION
  });
  
  try {
    // Extract parameters from the GraphQL query
    const groupName = event.arguments.groupName;
    
    if (!groupName) {
      throw new Error('groupName is required');
    }
    
    // Call Cognito API to list users in the group
    const params = {
      GroupName: groupName,
      UserPoolId: process.env.USER_POOL_ID
    };
    
    const result = await cognitoIdentityServiceProvider.listUsersInGroup(params).promise();
    
    // Transform the result to match your GraphQL schema
    const users = result.Users.map(user => ({
      username: user.Username,
      attributes: user.Attributes.reduce((acc, attr) => {
        acc[attr.Name] = attr.Value;
        return acc;
      }, {})
    }));
    
    // Return the result in the format expected by your GraphQL schema
    return {
      users: users
    };
  } catch (error) {
    console.error('Error listing users in group:', error);
    throw error;
  }
};
