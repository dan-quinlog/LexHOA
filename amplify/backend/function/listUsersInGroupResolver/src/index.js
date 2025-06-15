const { CognitoIdentityProviderClient, ListUsersInGroupCommand } = require('@aws-sdk/client-cognito-identity-provider');

exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event));
  
  // Handle both direct invocation and template-based invocation
  let field = event.field;
  let arguments = event.arguments;
  
  // If this is a direct invocation (no mapping template)
  if (!field && event.info && event.info.fieldName) {
    field = event.info.fieldName;
    arguments = event.arguments;
  }
  
  // Initialize Cognito Identity Provider Client
  const client = new CognitoIdentityProviderClient({ region: process.env.REGION });
  
  try {
    if (field !== 'listUsersInGroup') {
      throw new Error(`Unsupported field: ${field}`);
    }
    
    // Extract parameters from the GraphQL query
    const groupName = arguments.groupName;
    
    console.log('Looking for users in group:', groupName);
    
    if (!groupName) {
      throw new Error('groupName is required');
    }
    
    // Call Cognito API to list users in the group
    const params = {
      GroupName: groupName,
      UserPoolId: process.env.USER_POOL_ID
    };
    
    const command = new ListUsersInGroupCommand(params);
    const result = await client.send(command);
    
    // Transform the result to match your GraphQL schema
    return result.Users.map(user => {
      const attributes = {};
      if (user.Attributes) {
        user.Attributes.forEach(attr => {
          attributes[attr.Name] = attr.Value;
        });
      }
      
      return {
        username: user.Username,
        email: attributes.email || null,
        enabled: user.Enabled,
        userStatus: user.UserStatus,
        userCreateDate: user.UserCreateDate ? user.UserCreateDate.toISOString() : null,
        userLastModifiedDate: user.UserLastModifiedDate ? user.UserLastModifiedDate.toISOString() : null
      };
    });
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
