/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateProfile = /* GraphQL */ `
  subscription OnCreateProfile(
    $filter: ModelSubscriptionProfileFilterInput
    $owner: String
  ) {
    onCreateProfile(filter: $filter, owner: $owner) {
      id
      byTypeName
      byTypeBalance
      byTypeCreatedAt
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
      allowText
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
        city
        state
        zip
        profOwnerId
        profTenantId
        createdAt
        updatedAt
        __typename
      }
      tenantAtId
      createdPings {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateProfile = /* GraphQL */ `
  subscription OnUpdateProfile(
    $filter: ModelSubscriptionProfileFilterInput
    $owner: String
  ) {
    onUpdateProfile(filter: $filter, owner: $owner) {
      id
      byTypeName
      byTypeBalance
      byTypeCreatedAt
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
      allowText
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
        city
        state
        zip
        profOwnerId
        profTenantId
        createdAt
        updatedAt
        __typename
      }
      tenantAtId
      createdPings {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteProfile = /* GraphQL */ `
  subscription OnDeleteProfile(
    $filter: ModelSubscriptionProfileFilterInput
    $owner: String
  ) {
    onDeleteProfile(filter: $filter, owner: $owner) {
      id
      byTypeName
      byTypeBalance
      byTypeCreatedAt
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
      allowText
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
        city
        state
        zip
        profOwnerId
        profTenantId
        createdAt
        updatedAt
        __typename
      }
      tenantAtId
      createdPings {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateProperty = /* GraphQL */ `
  subscription OnCreateProperty(
    $filter: ModelSubscriptionPropertyFilterInput
    $owner: String
  ) {
    onCreateProperty(filter: $filter, owner: $owner) {
      id
      type
      owner
      address
      city
      state
      zip
      profOwner {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
        balance
        tenantAtId
        createdAt
        updatedAt
        __typename
      }
      profOwnerId
      profTenant {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
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
export const onUpdateProperty = /* GraphQL */ `
  subscription OnUpdateProperty(
    $filter: ModelSubscriptionPropertyFilterInput
    $owner: String
  ) {
    onUpdateProperty(filter: $filter, owner: $owner) {
      id
      type
      owner
      address
      city
      state
      zip
      profOwner {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
        balance
        tenantAtId
        createdAt
        updatedAt
        __typename
      }
      profOwnerId
      profTenant {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
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
export const onDeleteProperty = /* GraphQL */ `
  subscription OnDeleteProperty(
    $filter: ModelSubscriptionPropertyFilterInput
    $owner: String
  ) {
    onDeleteProperty(filter: $filter, owner: $owner) {
      id
      type
      owner
      address
      city
      state
      zip
      profOwner {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
        balance
        tenantAtId
        createdAt
        updatedAt
        __typename
      }
      profOwnerId
      profTenant {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
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
export const onCreatePayment = /* GraphQL */ `
  subscription OnCreatePayment(
    $filter: ModelSubscriptionPaymentFilterInput
    $owner: String
  ) {
    onCreatePayment(filter: $filter, owner: $owner) {
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
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
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
export const onUpdatePayment = /* GraphQL */ `
  subscription OnUpdatePayment(
    $filter: ModelSubscriptionPaymentFilterInput
    $owner: String
  ) {
    onUpdatePayment(filter: $filter, owner: $owner) {
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
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
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
export const onDeletePayment = /* GraphQL */ `
  subscription OnDeletePayment(
    $filter: ModelSubscriptionPaymentFilterInput
    $owner: String
  ) {
    onDeletePayment(filter: $filter, owner: $owner) {
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
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
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
export const onCreateBulletin = /* GraphQL */ `
  subscription OnCreateBulletin($filter: ModelSubscriptionBulletinFilterInput) {
    onCreateBulletin(filter: $filter) {
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
export const onUpdateBulletin = /* GraphQL */ `
  subscription OnUpdateBulletin($filter: ModelSubscriptionBulletinFilterInput) {
    onUpdateBulletin(filter: $filter) {
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
export const onDeleteBulletin = /* GraphQL */ `
  subscription OnDeleteBulletin($filter: ModelSubscriptionBulletinFilterInput) {
    onDeleteBulletin(filter: $filter) {
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
export const onCreatePing = /* GraphQL */ `
  subscription OnCreatePing($filter: ModelSubscriptionPingFilterInput) {
    onCreatePing(filter: $filter) {
      id
      type
      items
      instruction
      status
      profCreator {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
        balance
        tenantAtId
        createdAt
        updatedAt
        __typename
      }
      profCreatorId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdatePing = /* GraphQL */ `
  subscription OnUpdatePing($filter: ModelSubscriptionPingFilterInput) {
    onUpdatePing(filter: $filter) {
      id
      type
      items
      instruction
      status
      profCreator {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
        balance
        tenantAtId
        createdAt
        updatedAt
        __typename
      }
      profCreatorId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeletePing = /* GraphQL */ `
  subscription OnDeletePing($filter: ModelSubscriptionPingFilterInput) {
    onDeletePing(filter: $filter) {
      id
      type
      items
      instruction
      status
      profCreator {
        id
        byTypeName
        byTypeBalance
        byTypeCreatedAt
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
        allowText
        balance
        tenantAtId
        createdAt
        updatedAt
        __typename
      }
      profCreatorId
      createdAt
      updatedAt
      __typename
    }
  }
`;
