const AWS = require('aws-sdk');

exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event));
    
    // Initialize Cognito Identity Provider
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
        region: process.env.REGION
    });
    
    try {
        // Extract user ID from the request
        const userId = event.body ? JSON.parse(event.body).userId : null;
        
        if (!userId) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ error: 'userId is required' })
            };
        }
        
        // Get user's groups from Cognito
        const params = {
            UserPoolId: process.env.USER_POOL_ID,
            Username: userId
        };
        
        const userGroups = await cognitoIdentityServiceProvider.adminListGroupsForUser(params).promise();
        
        // Extract group names
        const groups = userGroups.Groups.map(group => group.GroupName);
        
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ groups })
        };
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: error.statusCode || 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ 
                error: error.message || 'An error occurred while retrieving user groups' 
            })
        };
    }
};
