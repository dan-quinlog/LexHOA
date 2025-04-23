import { gql } from '@apollo/client';

export const ADD_USER_TO_GROUP = gql`
  mutation AddUserToGroup($username: String!, $groupName: String!) {
    addUserToGroup(username: $username, groupName: $groupName) {
      success
      message
    }
  }
`;

export const REMOVE_USER_FROM_GROUP = gql`
  mutation RemoveUserFromGroup($username: String!, $groupName: String!) {
    removeUserFromGroup(username: $username, groupName: $groupName) {
      success
      message
    }
  }
`;
