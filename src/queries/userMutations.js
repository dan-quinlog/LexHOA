import { gql } from '@apollo/client';

export const ADD_USER_TO_GROUP = gql`
  mutation AddUserToGroup($userId: String!, $groupName: String!) {
    addUserToGroup(userId: $userId, groupName: $groupName) {
      message
      groups
    }
  }
`;

export const MANAGE_COGNITO_GROUPS = gql`
  mutation ManageCognitoGroups($action: String!, $groupName: String!, $cognitoId: String!) {
    manageCognitoGroups(action: $action, groupName: $groupName, cognitoId: $cognitoId) {
      success
      message
    }
  }
`;

export const PROCESS_MONTHLY_PROPERTY_DUES = gql`
  mutation ProcessMonthlyPropertyDues {
    processMonthlyPropertyDues {
      success
      message
    }
  }
`;
