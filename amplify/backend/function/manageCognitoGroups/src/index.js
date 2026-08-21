/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	AUTH_LEXHOA4FACA5B8_USERPOOLID
	AUTH_LEXHOA_USERPOOLID
Amplify Params - DO NOT EDIT */

const aws = require('aws-sdk');
const cognito = new aws.CognitoIdentityServiceProvider();
const VALID_GROUPS = ['BOARD', 'MEDIA', 'TREASURER', 'SECRETARY', 'PRESIDENT'];
const BOARD_REMOVAL_ORDER = ['MEDIA', 'TREASURER', 'SECRETARY', 'PRESIDENT', 'BOARD'];

/**
 * GraphQL resolver for managing Cognito user groups
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
async function manageCognitoGroups(event, client = cognito) {
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
            const callerGroupsResult = await client.adminListGroupsForUser({
                UserPoolId: userPoolId,
                Username: callerUsername
            }).promise();
            callerGroups = callerGroupsResult.Groups.map(group => group.GroupName);
        } catch (error) {
            throw new Error("Unable to verify your permissions");
        }
        
        if (!callerGroups.includes('PRESIDENT')) {
            throw new Error("Access denied. Only members of the PRESIDENT group can manage user groups.");
        }

        if (!VALID_GROUPS.includes(groupName)) {
            throw new Error(`Invalid group. Must be one of: ${VALID_GROUPS.join(', ')}`);
        }

        // Check if user exists
        try {
            await client.adminGetUser({
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
            await client.getGroup({
                GroupName: groupName,
                UserPoolId: userPoolId
            }).promise();
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                // Create the group if it doesn't exist
                await client.createGroup({
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
                const userGroups = await client.adminListGroupsForUser({
                    UserPoolId: userPoolId,
                    Username: cognitoId
                }).promise();
                
                const isInGroup = userGroups.Groups.some(group => group.GroupName === groupName);
                if (isInGroup) {
                    console.info('cognito_group_management', { action: 'add', outcome: 'unchanged' });
                    return {
                        success: true,
                        message: `User '${cognitoId}' is already in group '${groupName}'`
                    };
                }
            } catch (error) {
                // Continue to the idempotent add operation when membership lookup fails.
            }

            await client.adminAddUserToGroup({
                UserPoolId: userPoolId,
                Username: cognitoId,
                GroupName: groupName
            }).promise();

            console.info('cognito_group_management', { action: 'add', outcome: 'updated' });

            return {
                success: true,
                message: `Successfully added user '${cognitoId}' to group '${groupName}'`
            };
        } else {
            let groupsToRemove = [groupName];
            if (groupName === 'BOARD') {
                try {
                    const memberships = await client.adminListGroupsForUser({
                        UserPoolId: userPoolId,
                        Username: cognitoId
                    }).promise();
                    const currentGroups = new Set(memberships.Groups.map(group => group.GroupName));
                    groupsToRemove = BOARD_REMOVAL_ORDER.filter(group => currentGroups.has(group));
                } catch (error) {
                    throw new Error("Unable to verify board roles before removal");
                }
            }

            // Prevent the caller from removing the only PRESIDENT membership as part of
            // either a direct role change or complete board offboarding.
            if (groupsToRemove.includes('PRESIDENT')) {
                // Check if this is the caller trying to remove themselves
                if (callerUsername === cognitoId) {
                    // Get all users in PRESIDENT group
                    try {
                        const presidentsResult = await client.listUsersInGroup({
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
                        throw new Error("Unable to verify president count before removal");
                    }
                }
            }

            let removed = false;
            for (const role of groupsToRemove) {
                try {
                    await client.adminRemoveUserFromGroup({
                        UserPoolId: userPoolId,
                        Username: cognitoId,
                        GroupName: role
                    }).promise();
                    removed = true;
                } catch (error) {
                    if (error.code !== 'ResourceNotFoundException') {
                        throw error;
                    }
                }
            }

            console.info('cognito_group_management', {
                action: 'remove',
                outcome: removed ? 'updated' : 'unchanged'
            });
            return {
                success: true,
                message: groupName === 'BOARD'
                    ? removed
                        ? `Successfully removed user '${cognitoId}' from all board groups`
                        : `User '${cognitoId}' was not in any board groups`
                    : removed
                        ? `Successfully removed user '${cognitoId}' from group '${groupName}'`
                        : `User '${cognitoId}' was not in group '${groupName}'`
            };
        }

    } catch (error) {
        console.error('cognito_group_management_failed', { code: 'GROUP_MANAGEMENT_ERROR' });
        return {
            success: false,
            message: error.message
        };
    }
}

exports.handler = event => manageCognitoGroups(event);
exports._internals = { manageCognitoGroups, VALID_GROUPS, BOARD_REMOVAL_ORDER };
