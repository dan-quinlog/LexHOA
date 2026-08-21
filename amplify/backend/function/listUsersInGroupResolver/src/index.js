const { CognitoIdentityProviderClient, ListUsersInGroupCommand } = require('@aws-sdk/client-cognito-identity-provider');

const ALLOWED_GROUPS = ['BOARD', 'MEDIA', 'TREASURER', 'SECRETARY', 'PRESIDENT'];

function callerGroups(event) {
  const claim = event.identity?.claims?.['cognito:groups'];
  if (Array.isArray(claim)) return claim;
  if (typeof claim !== 'string') return [];
  try {
    const parsed = JSON.parse(claim);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    return claim.split(',').map(group => group.trim()).filter(Boolean);
  }
  return [];
}

async function listUsersInGroup(event, client) {
  if (!callerGroups(event).some(group => ALLOWED_GROUPS.includes(group))) {
    throw new Error('Access denied');
  }

  const field = event.field || event.info?.fieldName;
  if (field !== 'listUsersInGroup') {
    throw new Error('Unsupported operation');
  }

  const groupName = event.arguments?.groupName;
  if (!ALLOWED_GROUPS.includes(groupName)) {
    throw new Error('Unsupported group');
  }

  try {
    const result = await client.send(new ListUsersInGroupCommand({
      GroupName: groupName,
      UserPoolId: process.env.AUTH_LEXHOA4FACA5B8_USERPOOLID
    }));

    return (result.Users || []).map(user => {
      const email = (user.Attributes || []).find(attribute => attribute.Name === 'email');
      return {
        username: user.Username,
        email: email?.Value || null,
        enabled: user.Enabled,
        userStatus: user.UserStatus
      };
    });
  } catch (error) {
    console.error('list_users_in_group_failed', { code: 'COGNITO_DIRECTORY_ERROR' });
    throw new Error('Unable to list users');
  }
}

exports.handler = event => listUsersInGroup(
  event,
  new CognitoIdentityProviderClient({ region: process.env.REGION })
);

exports._internals = { ALLOWED_GROUPS, callerGroups, listUsersInGroup };
