import { gql } from '@apollo/client';

// Profile Queries
export const GET_PROFILE = gql`
  query GetProfile($id: ID!) {
    getProfile(id: $id) {
      id
      byTypeName
      byTypeBalance
      byTypeCreatedAt 
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
            owner
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
  }
`;

export const LIST_PROFILES = gql`
  query ListProfiles($filter: ModelProfileFilterInput, $limit: Int, $nextToken: String) {
    listProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt 
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
        byTypeName
        byTypeBalance
        byTypeCreatedAt 
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
            city
            state
            zip
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
              owner
            }
          }
        }
        tenantAt {
          id
          type
          address
          city
          state
          zip
          profOwnerId
          profOwner {
            id
            name
            phone
            email
            }
          profTenantId
          createdAt
          updatedAt
        }
        tenantAtId
        createdPings {
          items {
            id
            items
            instruction
            status
            createdAt
          }
        }
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
    $limit: Int
    $nextToken: String
  ) {
    profileByName(
      filter: { name: { contains: $name } }
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
    $limit: Int
    $nextToken: String
  ) {
    profileByEmail(
      filter: { email: { contains: $email } }
      sortDirection: $sortDirection
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        byTypeName
        byTypeBalance
        byTypeCreatedAt 
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

export const PROFILES_BY_TYPE_NAME = gql`
  query ProfilesByTypeName($byTypeName: String!, $sortDirection: ModelSortDirection) {
    profilesByTypeName(byTypeName: $byTypeName, sortDirection: $sortDirection) {
      items {
        id
        name
        email
        phone
        balance
        contactPref
        billingFreq
      }
    }
  }
`;

export const PROFILES_BY_TYPE_BALANCE = gql`
  query ProfilesByTypeBalance($byTypeBalance: String!, $sortDirection: ModelSortDirection) {
    profilesByTypeBalance(byTypeBalance: $byTypeBalance, sortDirection: $sortDirection) {
      items {
        id
        name
        balance
      }
    }
  }
`;

export const PROFILES_BY_TYPE_CREATEDAT = gql`
  query ProfilesByTypeCreatedAt($byTypeCreatedAt: String!, $sortDirection: ModelSortDirection) {
    profilesByTypeCreatedAt(byTypeCreatedAt: $byTypeCreatedAt, sortDirection: $sortDirection) {
      items {
        id
        name
        createdAt
      }
    }
  }
`;

export const SEARCH_PROFILES = gql`
  query SearchProfiles(
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProfiles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
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
        allowText
        balance
        ownedProperties {
          items {
            id
            profOwnerId
          }
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
        owner
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
        profOwnerId
        profTenantId
        profOwner {
          id
          name
        }
        profTenant {
          id
          name
        }
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
        profOwnerId
        profTenantId
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const SEARCH_PROPERTIES = gql`
  query SearchProperties(
    $filter: ModelPropertyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProperties(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        address
        profOwnerId
        profTenantId
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const FIND_RELATED_PROPERTIES = gql`
  query FindRelatedProperties($profileId: ID!) {
    listProperties(filter: {
      or: [
        { profOwnerId: { eq: $profileId } },
        { profTenantId: { eq: $profileId } }
      ]
    }) {
      items {
        id
        profOwnerId
        profTenantId
      }
    }
  }
`;

// Payment Queries
export const GET_PAYMENT = gql`
  query GetPayment($id: ID!) {
    getPayment(id: $id) {
      id
      byTypeCreatedAt
      byTypeCheckDate
      byTypeInvoiceNumber
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
        byTypeCreatedAt
        byTypeCheckDate
        byTypeInvoiceNumber
        checkDate
        checkNumber
        checkAmount
        invoiceNumber
        invoiceAmount
        ownerPayments {
          id
          name
        }
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
        byTypeCreatedAt
        byTypeCheckDate
        byTypeInvoiceNumber
        checkDate
        checkNumber
        checkAmount
        invoiceNumber
        invoiceAmount
        ownerPayments {
          id
          name
        }
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
        byTypeCreatedAt
        byTypeCheckDate
        byTypeInvoiceNumber
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

export const SEARCH_PINGS_BY_ID = gql`
  query GetPing($id: ID!) {
    getPing(id: $id) {
      id
      type
      items
      instruction
      status
      profCreatorId
      createdAt
      updatedAt
    }
  }
`;

export const SEARCH_PINGS_BY_CREATOR = gql`
  query PingsByCreator($profCreatorId: ID!) {
    pingsByCreator(profCreatorId: $profCreatorId) {
      items {
        id
        type
        items
        instruction
        status
        profCreatorId
        createdAt
        updatedAt
      }
    }
  }
`;

export const LIST_PENDING_PINGS = gql`
  query ListPendingPings {
    listPings(filter: { status: { eq: PENDING } }) {
      items {
        id
        type
        items
        instruction
        status
        profCreatorId
        createdAt
        updatedAt
      }
    }
  }
`;
