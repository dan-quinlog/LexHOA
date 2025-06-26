import { gql } from '@apollo/client';

export const LIST_USERS_IN_GROUP = gql`
  query ListUsersInGroup($groupName: String!) {
    listUsersInGroup(groupName: $groupName) {
      username
      email
      enabled
      userStatus
      userCreateDate
      userLastModifiedDate
    }
  }
`;
