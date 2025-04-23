const AWS = require('aws-sdk');

exports.handler = async (event) => {
  const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({ 
    apiVersion: '2016-04-08',
    region: process.env.REGION
  });
  
  try {
    // Get the username from the event
    const { username, email } = event;
    
    if (!username && !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username or email is required' })
      };
    }
    
    let user;
    
    if (username) {
      // Get user by username
      const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: username
      };
      
      user = await cognitoIdentityServiceProvider.adminGetUser(params).promise();
    } else if (email) {
      // List users by email filter
      const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Filter: `email = "${email}"`
      };
      
      const result = await cognitoIdentityServiceProvider.listUsers(params).promise();
      if (result.Users && result.Users.length > 0) {
        user = result.Users[0];
      }
    }
    
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ User: user })
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
