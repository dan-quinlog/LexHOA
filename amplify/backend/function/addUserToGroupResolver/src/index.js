const AWS = require('aws-sdk');

exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event));
  
  // Initialize Cognito Identity Provider
  const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
    region: process.env.REGION
  });
  
  try {
    // Extract parameters from the GraphQL mutation
    const { username, groupName } = event.arguments;
    
    if (!username || !groupName) {
      throw new Error('username and groupName are required');
    }
    
    // Add user to group
    const addToGroupParams = {
      GroupName: groupName,
      UserPoolId: process.env.USER_POOL_ID,
      Username: username
    };
    
    await cognitoIdentityServiceProvider.adminAddUserToGroup(addToGroupParams).promise();
    
    // Return success response
    return {
      success: true,
      message: `User ${username} successfully added to group ${groupName}`
    };
  } catch (error) {
    console.error('Error adding user to group:', error);
    throw error;
  }
};
