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
  query GetProfile($cognitoId: String!) {
    getPersonByCognitoId(cognitoId: $cognitoId) {
      id
      name
      email
      address1
      address2
      city
      state
      zip
      phoneCall
      phoneText
      contactPref
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
