import { gql } from '@apollo/client';

export const ADD_USER_TO_GROUP = gql`
  mutation AddUserToGroup($userId: String!, $groupName: String!) {
    addUserToGroup(userId: $userId, groupName: $groupName) {
      message
      groups
    }
  }
`;
