const AWS = require('aws-sdk');

exports.handler = async (event) => {
  const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({ 
    apiVersion: '2016-04-08',
    region: process.env.REGION
  });
  
  try {
    // Get the username from the event
    const username = event.username;
    
    if (!username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username is required' })
      };
    }
    
    // Call the AdminListGroupsForUser API
    const params = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: username
    };
    
    const result = await cognitoIdentityServiceProvider.adminListGroupsForUser(params).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        groups: result.Groups.map(group => ({
          groupName: group.GroupName,
          description: group.Description,
          precedence: group.Precedence,
          creationDate: group.CreationDate,
          lastModifiedDate: group.LastModifiedDate
        }))
      })
    };
  } catch (error) {
    console.error('Error listing groups for user:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
