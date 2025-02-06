import { gql } from '@apollo/client';

// Profile Queries
export const GET_PROFILE = gql`
  query GetProfile($id: ID!) {
    getProfile(id: $id) {
      id
      type
      cognitoID
      name
      email
      phone
      address
      city
      state
      zip
      contactPref
      billingFreq
      balance
      ownedProperties {
        items {
          id
          type
          address
          profOwnerId
          profTenantId
          createdAt
          updatedAt
          profTenant {
            id
            name
            email
            phone
            contactPref
          }
        }
      }
      tenantAt {
        id
        type
        address
        ownerId
        tenantId
        createdAt
        updatedAt
      }
      tenantAtId
      createdAt
      updatedAt
      owner
    }
  }
`;

export const LIST_PROFILES = gql`
  query ListProfiles($filter: ModelProfileFilterInput, $limit: Int, $nextToken: String) {
    listProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        cognitoID
        name
        email
        phone
        address
        city
        state
        zip
        contactPref
        billingFreq
        balance
        tenantAtId
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

export const PROFILE_BY_COGNITO_ID = gql`
  query ProfileByCognitoID(
    $cognitoID: String!
    $sortDirection: ModelSortDirection
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    profileByCognitoID(
      cognitoID: $cognitoID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        cognitoID
        name
        email
        phone
        address
        city
        state
        zip
        contactPref
        billingFreq
        balance
        ownedProperties {
          items {
            id
            type
            address
            profOwnerId
            profTenantId
            createdAt
            updatedAt
            profTenant {
              id
              name
              email
              phone
              contactPref
            }
          }
        }
        tenantAt {
          id
          type
          address
          profOwnerId
          profTenantId
          createdAt
          updatedAt
        }
        tenantAtId
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

export const PROFILE_BY_NAME = gql`
  query ProfileByName(
    $name: String!
    $sortDirection: ModelSortDirection
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    profileByName(
      name: $name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        cognitoID
        name
        email
        phone
        address
        city
        state
        zip
        contactPref
        billingFreq
        balance
        tenantAtId
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

export const PROFILE_BY_EMAIL = gql`
  query ProfileByEmail(
    $email: String!
    $sortDirection: ModelSortDirection
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    profileByEmail(
      email: $email
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        cognitoID
        name
        email
        phone
        address
        city
        state
        zip
        contactPref
        billingFreq
        balance
        tenantAtId
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

export const PROFILE_BY_PHONE = gql`
  query ProfileByPhone(
    $phone: String!
    $sortDirection: ModelSortDirection
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    profileByPhone(
      phone: $phone
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        cognitoID
        name
        email
        phone
        address
        city
        state
        zip
        contactPref
        billingFreq
        balance
        tenantAtId
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

// Property Queries
export const GET_PROPERTY = gql`
  query GetProperty($id: ID!) {
    getProperty(id: $id) {
      id
      type
      address
      profOwner {
        id
        name
        email
        phone
      }
      profOwnerId
      profTenant {
        id
        name
        email
        phone
      }
      profTenantId
      createdAt
      updatedAt
    }
  }
`;

export const LIST_PROPERTIES = gql`
  query ListProperties($filter: ModelPropertyFilterInput, $limit: Int, $nextToken: String) {
    listProperties(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        address
        ownerId
        tenantId
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const PROPERTY_BY_ADDRESS = gql`
  query PropertyByAddress(
    $address: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPropertyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    propertyByAddress(
      address: $address
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        address
        ownerId
        tenantId
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Payment Queries
export const GET_PAYMENT = gql`
  query GetPayment($id: ID!) {
    getPayment(id: $id) {
      id
      type
      checkDate
      checkNumber
      checkAmount
      invoiceNumber
      invoiceAmount
      ownerPayments {
        id
        name
        email
      }
      ownerPaymentsId
      createdAt
      updatedAt
      owner
    }
  }
`;

export const LIST_PAYMENTS = gql`
  query ListPayments($filter: ModelPaymentFilterInput, $limit: Int, $nextToken: String) {
    listPayments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        checkDate
        checkNumber
        checkAmount
        invoiceNumber
        invoiceAmount
        ownerPaymentsId
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

export const PAYMENTS_BY_OWNER = gql`
  query PaymentsByOwner(
    $ownerPaymentsId: ID!
    $checkDate: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPaymentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    paymentsByOwner(
      ownerPaymentsId: $ownerPaymentsId
      checkDate: $checkDate
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        checkDate
        checkNumber
        checkAmount
        invoiceNumber
        invoiceAmount
        ownerPaymentsId
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

export const PAYMENTS_BY_INVOICE_NUMBER = gql`
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
        type
        checkDate
        checkNumber
        checkAmount
        invoiceNumber
        invoiceAmount
        ownerPaymentsId
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
  `;

// Bulletin Queries
export const GET_BULLETIN = gql`
  query GetBulletin($id: ID!) {
    getBulletin(id: $id) {
      id
      title
      content
      type
      audience
      createdAt
      updatedAt
    }
  }
`;

export const LIST_BULLETINS = gql`
  query ListBulletins($filter: ModelBulletinFilterInput, $limit: Int, $nextToken: String) {
    listBulletins(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        content
        type
        audience
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const BULLETINS_BY_DATE = gql`
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
      }
      nextToken
    }
  }
`;
