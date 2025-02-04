/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getProfile = /* GraphQL */ `
  query GetProfile($id: ID!) {
    getProfile(id: $id) {
      id
      type
      owner
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
        nextToken
        __typename
      }
      payments {
        nextToken
        __typename
      }
      tenantAt {
        id
        type
        owner
        address
        profOwnerId
        profTenantId
        createdAt
        updatedAt
        __typename
      }
      tenantAtId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listProfiles = /* GraphQL */ `
  query ListProfiles(
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        owner
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
      type
      owner
      address
      profOwner {
        id
        type
        owner
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
        __typename
      }
      profOwnerId
      profTenant {
        id
        type
        owner
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
        __typename
      }
      profTenantId
      createdAt
      updatedAt
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
        type
        owner
        address
        profOwnerId
        profTenantId
        createdAt
        updatedAt
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
      type
      checkDate
      checkNumber
      checkAmount
      invoiceNumber
      invoiceAmount
      ownerPayments {
        id
        type
        owner
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
        __typename
      }
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPing = /* GraphQL */ `
  query GetPing($id: ID!) {
    getPing(id: $id) {
      id
      type
      items
      instruction
      status
      createdBy
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listPings = /* GraphQL */ `
  query ListPings(
    $filter: ModelPingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        items
        instruction
        status
        createdBy
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const profilesByType = /* GraphQL */ `
  query ProfilesByType(
    $type: String!
    $nameBalanceCreatedAt: ModelProfileByTypeCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    profilesByType(
      type: $type
      nameBalanceCreatedAt: $nameBalanceCreatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        owner
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const profileByCognitoID = /* GraphQL */ `
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
        owner
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const profileByName = /* GraphQL */ `
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
        owner
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const profileByEmail = /* GraphQL */ `
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
        owner
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const profileByPhone = /* GraphQL */ `
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
        owner
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const profilesByBalance = /* GraphQL */ `
  query ProfilesByBalance(
    $balance: Float!
    $name: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    profilesByBalance(
      balance: $balance
      name: $name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        owner
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const profilesByTenantAtId = /* GraphQL */ `
  query ProfilesByTenantAtId(
    $tenantAtId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    profilesByTenantAtId(
      tenantAtId: $tenantAtId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        owner
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const propertiesByType = /* GraphQL */ `
  query PropertiesByType(
    $type: String!
    $id: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPropertyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    propertiesByType(
      type: $type
      id: $id
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        owner
        address
        profOwnerId
        profTenantId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const propertyByAddress = /* GraphQL */ `
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
        owner
        address
        profOwnerId
        profTenantId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const propertiesByProfOwnerId = /* GraphQL */ `
  query PropertiesByProfOwnerId(
    $profOwnerId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPropertyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    propertiesByProfOwnerId(
      profOwnerId: $profOwnerId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        owner
        address
        profOwnerId
        profTenantId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const propertiesByProfTenantId = /* GraphQL */ `
  query PropertiesByProfTenantId(
    $profTenantId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPropertyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    propertiesByProfTenantId(
      profTenantId: $profTenantId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        owner
        address
        profOwnerId
        profTenantId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const paymentsByType = /* GraphQL */ `
  query PaymentsByType(
    $type: String!
    $createdAtCheckDateInvoiceNumber: ModelPaymentByTypeCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPaymentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    paymentsByType(
      type: $type
      createdAtCheckDateInvoiceNumber: $createdAtCheckDateInvoiceNumber
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const paymentsByCheckDate = /* GraphQL */ `
  query PaymentsByCheckDate(
    $checkDate: AWSDate!
    $sortDirection: ModelSortDirection
    $filter: ModelPaymentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    paymentsByCheckDate(
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const paymentsByCheckNumber = /* GraphQL */ `
  query PaymentsByCheckNumber(
    $checkNumber: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPaymentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    paymentsByCheckNumber(
      checkNumber: $checkNumber
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
    $checkDateInvoiceNumber: ModelPaymentByOwnerPaymentsCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPaymentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    paymentsByOwner(
      ownerPaymentsId: $ownerPaymentsId
      checkDateInvoiceNumber: $checkDateInvoiceNumber
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const pingByDate = /* GraphQL */ `
  query PingByDate(
    $type: String!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    pingByDate(
      type: $type
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        items
        instruction
        status
        createdBy
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const pingsByCreator = /* GraphQL */ `
  query PingsByCreator(
    $createdBy: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    pingsByCreator(
      createdBy: $createdBy
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        items
        instruction
        status
        createdBy
        createdAt
        updatedAt
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
