/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	AUTH_LEXHOA4FACA5B8_USERPOOLID
	AUTH_LEXHOA_USERPOOLID
Amplify Params - DO NOT EDIT */

const aws = require('aws-sdk');
const cognito = new aws.CognitoIdentityServiceProvider();

/**
 * GraphQL resolver for managing Cognito user groups
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    try {
        const { action, groupName, cognitoId } = event.arguments;
        const userPoolId = process.env.AUTH_LEXHOA4FACA5B8_USERPOOLID || process.env.AUTH_LEXHOA_USERPOOLID;
        
        // Get the caller's identity from the event context
        const callerUsername = event.identity?.username;
        if (!callerUsername) {
            throw new Error("Unable to identify the calling user. You must be authenticated to perform this action.");
        }

        if (!action || !groupName || !cognitoId) {
            throw new Error("Missing required parameters: action, groupName, and cognitoId");
        }

        if (!['add', 'remove'].includes(action.toLowerCase())) {
            throw new Error("Action must be 'add' or 'remove'");
        }
        
        // Check if caller is in PRESIDENT group
        let callerGroups;
        try {
            const callerGroupsResult = await cognito.adminListGroupsForUser({
                UserPoolId: userPoolId,
                Username: callerUsername
            }).promise();
            callerGroups = callerGroupsResult.Groups.map(group => group.GroupName);
        } catch (error) {
            console.error('Error checking caller groups:', error);
            throw new Error("Unable to verify your permissions");
        }
        
        if (!callerGroups.includes('PRESIDENT')) {
            throw new Error("Access denied. Only members of the PRESIDENT group can manage user groups.");
        }

        const validGroups = ['BOARD', 'MEDIA', 'TREASURER', 'SECRETARY', 'PRESIDENT'];
        if (!validGroups.includes(groupName)) {
            throw new Error(`Invalid group. Must be one of: ${validGroups.join(', ')}`);
        }

        // Check if user exists
        try {
            await cognito.adminGetUser({
                UserPoolId: userPoolId,
                Username: cognitoId
            }).promise();
        } catch (error) {
            if (error.code === 'UserNotFoundException') {
                throw new Error(`User with Cognito ID '${cognitoId}' not found`);
            }
            throw error;
        }

        // Ensure the group exists
        try {
            await cognito.getGroup({
                GroupName: groupName,
                UserPoolId: userPoolId
            }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                // Create the group if it doesn't exist
                await cognito.createGroup({
                    GroupName: groupName,
                    UserPoolId: userPoolId,
                    Description: `${groupName} group for HOA management`
                }).promise();
            } else {
                throw error;
            }
        }

        if (action.toLowerCase() === 'add') {
            // Check if user is already in the group
            try {
                const userGroups = await cognito.adminListGroupsForUser({
                    UserPoolId: userPoolId,
                    Username: cognitoId
                }).promise();
                
                const isInGroup = userGroups.Groups.some(group => group.GroupName === groupName);
                if (isInGroup) {
                    return {
                        success: true,
                        message: `User '${cognitoId}' is already in group '${groupName}'`
                    };
                }
            } catch (error) {
                console.error('Error checking user groups:', error);
            }

            await cognito.adminAddUserToGroup({
                UserPoolId: userPoolId,
                Username: cognitoId,
                GroupName: groupName
            }).promise();

            return {
                success: true,
                message: `Successfully added user '${cognitoId}' to group '${groupName}'`
            };
        } else {
            // Remove user from group
            
            // Special check for PRESIDENT group - prevent removing the last president
            if (groupName === 'PRESIDENT') {
                // Check if this is the caller trying to remove themselves
                if (callerUsername === cognitoId) {
                    // Get all users in PRESIDENT group
                    try {
                        const presidentsResult = await cognito.listUsersInGroup({
                            UserPoolId: userPoolId,
                            GroupName: 'PRESIDENT'
                        }).promise();
                        
                        if (presidentsResult.Users.length <= 1) {
                            throw new Error("Cannot remove yourself from the PRESIDENT group when you are the only president. Please add another president first.");
                        }
                    } catch (listError) {
                        if (listError.message.includes("Cannot remove yourself")) {
                            throw listError;
                        }
                        console.error('Error checking president count:', listError);
                        throw new Error("Unable to verify president count before removal");
                    }
                }
            }
            
            try {
                await cognito.adminRemoveUserFromGroup({
                    UserPoolId: userPoolId,
                    Username: cognitoId,
                    GroupName: groupName
                }).promise();

                return {
                    success: true,
                    message: `Successfully removed user '${cognitoId}' from group '${groupName}'`
                };
            } catch (error) {
                if (error.code === 'ResourceNotFoundException') {
                    return {
                        success: true,
                        message: `User '${cognitoId}' was not in group '${groupName}'`
                    };
                } else {
                    throw error;
                }
            }
        }

    } catch (error) {
        console.error('Error managing Cognito groups:', error);
        return {
            success: false,
            message: error.message
        };
    }
};
