import { gql } from '@apollo/client';

export const GET_LATEST_BULLETINS = gql`
  query GetLatestBulletins {
    listBulletins(
      limit: 3, 
      sortDirection: DESC, 
      sortField: "datePosted",
      filter: { datePosted: { ne: null } }
    ) {
      items {
        id
        title
        content
        datePosted
      }
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
    listBulletins(
      limit: $limit,
      nextToken: $nextToken,
      sortDirection: DESC,
      sortField: "datePosted"
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
