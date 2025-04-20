const AWS = require('aws-sdk');

exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event));
    
    // Initialize Cognito Identity Provider
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
        region: process.env.REGION
    });
    
    try {
        // Extract group name from the request
        const groupName = event.body ? JSON.parse(event.body).groupName : null;
        
        if (!groupName) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ error: 'groupName is required' })
            };
        }
        
        // List users in the group
        const params = {
            GroupName: groupName,
            UserPoolId: process.env.USER_POOL_ID,
            Limit: 60 // Adjust as needed
        };
        
        const result = await cognitoIdentityServiceProvider.listUsersInGroup(params).promise();
        
        // Extract user information
        const users = result.Users.map(user => {
            const attributes = {};
            user.Attributes.forEach(attr => {
                attributes[attr.Name] = attr.Value;
            });
            
            return {
                username: user.Username,
                enabled: user.Enabled,
                status: user.UserStatus,
                created: user.UserCreateDate,
                modified: user.UserLastModifiedDate,
                attributes
            };
        });
        
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ users })
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
                error: error.message || 'An error occurred while listing users in group' 
            })
        };
    }
};
