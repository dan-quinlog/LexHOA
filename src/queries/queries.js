import { gql } from '@apollo/client';

export const GET_LATEST_BULLETINS = gql`
  query BulletinsByDate($limit: Int!, $nextToken: String, $filter: ModelBulletinFilterInput) {
    bulletinsByDate(type: "Bulletin", sortDirection: DESC, limit: $limit, nextToken: $nextToken, filter: $filter) {
      items {
        id
        title
        content
        audience
        createdAt
      }
      nextToken
    }
  }
`;

export const GET_PROFILE = gql`
  query GetProfile($cognitoID: String!) {
    personByCognitoID(cognitoID: $cognitoID) {
      items {
        id
        name
        email
        address
        city
        state
        zip
        phone
        allowText
        contactPref
      }
    }
  }
`;

export const GET_BULLETINS = gql`
  query GetBulletins($limit: Int, $nextToken: String) {
    bulletinsByDate(
      bulletin: "post",
      sortDirection: DESC,
      limit: $limit,
      nextToken: $nextToken
    ) {
      items {
        id
        title
        content
        audience
        datePosted
      }
      nextToken
    }
  }
`;

export const LIST_PEOPLE = gql`
  query ListPeople {
    listPeople {
      items {
        id
        name
        email
        cognitoId
      }
    }
  }
`;

export const SEARCH_PEOPLE_BY_EMAIL = gql`
  query PersonByEmail($email: String!) {
    personByEmail(email: $email) {
      items {
        id
        name
        email
        address
        city
        state
        zip
        phone
        allowText
        contactPref
        owner
      }
      nextToken
    }
  }
`;

export const SEARCH_PEOPLE_BY_NAME = gql`
  query PersonByName($name: String!) {
    personByName(name: $name) {
      items {
        id
        name
        email
        address
        city
        state
        zip
        phone
        allowText
        contactPref
        owner
      }
      nextToken
    }
  }
`;
export const SEARCH_PEOPLE_BY_PHONE = gql`
  query SearchPeopleByPhone($phone: String!) {
    personByPhone(phone: $phone) {
      items {
        id
        name
        email
        address
        city
        state
        zip
        phone
        allowText
        contactPref
        owner
      }
    }
  }
`;
