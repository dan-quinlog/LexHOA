const AWS = require('aws-sdk');

exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event));
    
    // Initialize Cognito Identity Provider
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
        region: process.env.REGION
    });
    
    try {
        // Parse request body
        const requestBody = event.body ? JSON.parse(event.body) : {};
        const { userId, groupName } = requestBody;
        
        if (!userId || !groupName) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ error: 'userId and groupName are required' })
            };
        }
        
        // Add user to group
        const addToGroupParams = {
            GroupName: groupName,
            UserPoolId: process.env.USER_POOL_ID,
            Username: userId
        };
        
        await cognitoIdentityServiceProvider.adminAddUserToGroup(addToGroupParams).promise();
        
        // Get updated list of user's groups
        const listGroupsParams = {
            UserPoolId: process.env.USER_POOL_ID,
            Username: userId
        };
        
        const userGroups = await cognitoIdentityServiceProvider.adminListGroupsForUser(listGroupsParams).promise();
        const groups = userGroups.Groups.map(group => group.GroupName);
        
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ 
                message: `User ${userId} successfully added to group ${groupName}`,
                groups
            })
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
                error: error.message || 'An error occurred while adding user to group' 
            })
        };
    }
};
