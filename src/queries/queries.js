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

export const SEARCH_ACCOUNTS = gql`
  query SearchAccounts($filter: ModelAccountFilterInput, $limit: Int, $nextToken: String) {
    listAccounts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        accountOwnerId
        accountName
        billingFreq
        balance
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const SEARCH_PROPERTIES = gql`
  query SearchProperties($unitNumber: String, $accountId: ID, $tenantId: ID, $limit: Int, $nextToken: String) {
    listProperties(filter: {
      or: [
        { address: { contains: $unitNumber } },
        { accountPropertiesId: { eq: $accountId } },
        { propertyTenantId: { eq: $tenantId } }
      ]
    }, limit: $limit, nextToken: $nextToken) {
      items {
        id
        address
        account {
          id
          accountName
          owner {
            id
            name
          }
        }
        tenant {
          id
          name
        }
      }
      nextToken
    }
  }
`;

export const SEARCH_PAYMENTS = gql`
  query SearchPayments($accountId: ID, $paymentId: ID, $limit: Int, $nextToken: String) {
    paymentsByOwner(ownerPaymentsId: $accountId, sortDirection: DESC, limit: $limit, nextToken: $nextToken) {
      items {
        id
        checkDate
        checkNumber
        checkAmount
        invoiceNumber
        invoiceAmount
        ownerPaymentsId
      }
      nextToken
    }
  }
`;
