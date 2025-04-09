const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  
  // Parse request body
  const requestBody = JSON.parse(event.body);
  const { userId, groupName } = requestBody;
  
  // Extract caller information from JWT claims
  const claims = event.requestContext.authorizer.claims;
  const callerGroups = claims['cognito:groups'] || [];
  
  // Get environment variables
  const userPoolId = process.env.AUTH_LEXHOA_USERPOOLID;
  const presidentGroup = process.env.PRESIDENT_GROUP_NAME || 'PRESIDENT';
  
  // Check if caller is in the PRESIDENT_GROUP
  if (!callerGroups.includes(presidentGroup)) {
    return {
      statusCode: 403,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Unauthorized: Only the President can modify user groups' })
    };
  }
  
  // Validate input
  if (!userId || !groupName) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Missing required parameters: userId and groupName are required' })
    };
  }
  
  try {
    // Check if removing from PRESIDENT group
    if (groupName === presidentGroup) {
      // Get all users in the PRESIDENT group
      const listUsersParams = {
        GroupName: presidentGroup,
        UserPoolId: userPoolId
      };
      
      const presidentsResult = await cognito.listUsersInGroup(listUsersParams).promise();
      
      // If there's only one president and we're trying to remove them, prevent it
      if (presidentsResult.Users.length <= 1 && 
          presidentsResult.Users.some(user => user.Username === userId)) {
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
          },
          body: JSON.stringify({ 
            message: 'Cannot remove the last President. Assign another President first.' 
          })
        };
      }
    }
    
    // Remove user from group
    const params = {
      GroupName: groupName,
      UserPoolId: userPoolId,
      Username: userId
    };
    
    await cognito.adminRemoveUserFromGroup(params).promise();
    
    // Get updated groups for user
    const listParams = {
      UserPoolId: userPoolId,
      Username: userId
    };
    
    const result = await cognito.adminListGroupsForUser(listParams).promise();
    const groups = result.Groups.map(group => group.GroupName);
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ 
        message: `User ${userId} successfully removed from group ${groupName}`,
        groups 
      })
    };
  } catch (error) {
    console.error('Error removing user from group:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Error removing user from group', error: error.message })
    };
  }
};
