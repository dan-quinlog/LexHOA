/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPerson = /* GraphQL */ `
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
      billingFreq
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
        billingFreq
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
      invoiceNumber
      invoiceAmount
      ownerPaymentsId
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
        invoiceNumber
        invoiceAmount
        ownerPaymentsId
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
export const personByCognitoID = /* GraphQL */ `
  query PersonByCognitoID(
    $cognitoID: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPersonFilterInput
    $limit: Int
    $nextToken: String
  ) {
    personByCognitoID(
      cognitoID: $cognitoID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
        billingFreq
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
export const personByName = /* GraphQL */ `
  query PersonByName(
    $name: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPersonFilterInput
    $limit: Int
    $nextToken: String
  ) {
    personByName(
      name: $name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
        billingFreq
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
export const personByEmail = /* GraphQL */ `
  query PersonByEmail(
    $email: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPersonFilterInput
    $limit: Int
    $nextToken: String
  ) {
    personByEmail(
      email: $email
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
        billingFreq
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
export const personByPhoneCall = /* GraphQL */ `
  query PersonByPhoneCall(
    $phone: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPersonFilterInput
    $limit: Int
    $nextToken: String
  ) {
    personByPhoneCall(
      phone: $phone
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
        billingFreq
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
export const accountByOwner = /* GraphQL */ `
  query AccountByOwner(
    $accountOwnerId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelAccountFilterInput
    $limit: Int
    $nextToken: String
  ) {
    accountByOwner(
      accountOwnerId: $accountOwnerId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        accountOwnerId
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
export const propertyByAccount = /* GraphQL */ `
  query PropertyByAccount(
    $accountPropertiesId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPropertyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    propertyByAccount(
      accountPropertiesId: $accountPropertiesId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
export const propertyByTenant = /* GraphQL */ `
  query PropertyByTenant(
    $propertyTenantId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPropertyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    propertyByTenant(
      propertyTenantId: $propertyTenantId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
export const paymentsByInvoiceNumber = /* GraphQL */ `
  query PaymentsByInvoiceNumber(
    $invoiceNumber: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPaymentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    paymentsByInvoiceNumber(
      invoiceNumber: $invoiceNumber
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const paymentsByOwner = /* GraphQL */ `
  query PaymentsByOwner(
    $ownerPaymentsId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPaymentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    paymentsByOwner(
      ownerPaymentsId: $ownerPaymentsId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
      type
      audience
      createdAt
      updatedAt
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
        type
        audience
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const bulletinsByDate = /* GraphQL */ `
  query BulletinsByDate(
    $type: String!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelBulletinFilterInput
    $limit: Int
    $nextToken: String
  ) {
    bulletinsByDate(
      type: $type
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        content
        type
        audience
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
