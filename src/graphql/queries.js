/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPersonByCognitoId = /* GraphQL */ `
  query GetPersonByCognitoId($cognitoId: String!) {
    getPersonByCognitoId(cognitoId: $cognitoId) {
      id
      name
      email
      add1
      add2
      city
      state
      zip
      phoneCall
      phoneText
      contactPref
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const getPerson = /* GraphQL */ `
  query GetPerson($id: ID!) {
    getPerson(id: $id) {
      id
      name
      email
      add1
      add2
      city
      state
      zip
      phoneCall
      phoneText
      contactPref
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listPeople = /* GraphQL */ `
  query ListPeople(
    $filter: ModelPersonFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPeople(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        add1
        add2
        city
        state
        zip
        phoneCall
        phoneText
        contactPref
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAccount = /* GraphQL */ `
  query GetAccount($id: ID!) {
    getAccount(id: $id) {
      id
      accountOwnerId
      accountName
      billingFreq
      balance
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listAccounts = /* GraphQL */ `
  query ListAccounts(
    $filter: ModelAccountFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAccounts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        accountOwnerId
        accountName
        billingFreq
        balance
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getProperty = /* GraphQL */ `
  query GetProperty($id: ID!) {
    getProperty(id: $id) {
      id
      address
      accountPropertiesId
      propertyTenantId
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listProperties = /* GraphQL */ `
  query ListProperties(
    $filter: ModelPropertyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProperties(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        address
        accountPropertiesId
        propertyTenantId
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPayment = /* GraphQL */ `
  query GetPayment($id: ID!) {
    getPayment(id: $id) {
      id
      checkDate
      checkNumber
      checkAmount
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listPayments = /* GraphQL */ `
  query ListPayments(
    $filter: ModelPaymentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPayments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        checkDate
        checkNumber
        checkAmount
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getBulletin = /* GraphQL */ `
  query GetBulletin($id: ID!) {
    getBulletin(id: $id) {
      id
      title
      content
      audience
      datePosted
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listBulletins = /* GraphQL */ `
  query ListBulletins(
    $filter: ModelBulletinFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBulletins(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        content
        audience
        datePosted
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
