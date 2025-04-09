const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  
  // Parse request body
  const requestBody = JSON.parse(event.body);
  const userId = requestBody.userId;
  
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
      body: JSON.stringify({ message: 'Unauthorized: Only the President can view user groups' })
    };
  }
  
  try {
    // List groups for user
    const params = {
      UserPoolId: userPoolId,
      Username: userId
    };
    
    const result = await cognito.adminListGroupsForUser(params).promise();
    const groups = result.Groups.map(group => group.GroupName);
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ groups })
    };
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Error fetching user groups', error: error.message })
    };
  }
};
