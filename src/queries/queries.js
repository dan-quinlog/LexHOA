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
        cognitoID
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

export const SEARCH_PEOPLE_BY_PHONE = gql`
  query SearchPeopleByPhone($phone: String!) {
    personByPhone(phone: $phone) {
      items {
        id
        cognitoID
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

export const SEARCH_PEOPLE_BY_ID = gql`
  query GetPerson($id: ID!) {
    getPerson(id: $id) {
      id
      cognitoID
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
  query ListProperties($filter: ModelPropertyFilterInput) {
    listProperties(filter: $filter) {
      items {
        id
        address
        accountPropertiesId
        propertyTenantId
        createdAt
        updatedAt
      }
    }
  }
`;

export const SEARCH_PROPERTIES_BY_ACCOUNT = gql`
  query PropertyByAccount($accountPropertiesId: ID!) {
    propertyByAccount(accountPropertiesId: $accountPropertiesId) {
      items {
        id
        address
        accountPropertiesId
        propertyTenantId
        createdAt
        updatedAt
      }
    }
  }
`;

export const SEARCH_PROPERTIES_BY_TENANT = gql`
  query PropertyByTenant($propertyTenantId: ID!) {
    propertyByTenant(propertyTenantId: $propertyTenantId) {
      items {
        id
        address
        accountPropertiesId
        propertyTenantId
        createdAt
        updatedAt
      }
    }
  }
`;
export const SEARCH_PAYMENTS = gql`
  query SearchPayments($filter: ModelPaymentFilterInput, $limit: Int, $nextToken: String) {
    listPayments(filter: $filter, limit: $limit, nextToken: $nextToken) {
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

export const SEARCH_ACCOUNTS_BY_OWNER = gql`
  query AccountByOwner($accountOwnerId: ID!) {
    accountByOwner(accountOwnerId: $accountOwnerId) {
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

export const SEARCH_PAYMENTS_BY_OWNER = gql`
  query PaymentsByOwner($ownerPaymentsId: ID!) {
    paymentsByOwner(ownerPaymentsId: $ownerPaymentsId) {
      items {
        id
        checkDate
        checkNumber
        checkAmount
        invoiceNumber
        invoiceAmount
        ownerPaymentsId
        createdAt
        updatedAt
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
        cognitoID
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const SEARCH_PERSONS = gql`
  query SearchPersons($searchType: String!, $searchTerm: String!) {
    searchPersons(searchType: $searchType, searchTerm: $searchTerm) {
      id
      name
      email
      phone
      role
      status
      cognitoID
    }
  }
`;

export const GET_ACCOUNT_BY_OWNER = gql`
  query AccountByOwner($accountOwnerId: ID!) {
    accountByOwner(accountOwnerId: $accountOwnerId) {
      items {
        id
        accountName
        accountOwnerId
        balance
        billingFreq
      }
    }
  }
`;
