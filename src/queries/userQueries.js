import { gql } from '@apollo/client';

export const LIST_USERS_IN_GROUP = gql`
  query ListUsersInGroup($groupName: String!) {
    listUsersInGroup(groupName: $groupName) {
      users {
        username
        attributes {
          name
          email
          phone_number
        }
      }
    }
  }
`;

export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      user {
        username
        attributes {
          name
          email
          phone_number
        }
      }
    }
  }
`;

export const GET_USER_BY_NAME = gql`
  query GetUserByName($name: String!) {
    getUserByName(name: $name) {
      users {
        username
        attributes {
          name
          email
          phone_number
        }
      }
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(id: $id) {
      user {
        username
        attributes {
          name
          email
          phone_number
        }
      }
    }
  }
`;

export const LIST_GROUPS_FOR_USER = gql`
  query ListGroupsForUser($username: String!) {
    listGroupsForUser(username: $username) {
      groups {
        groupName
      }
    }
  }
`;
