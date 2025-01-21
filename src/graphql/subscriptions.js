/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreatePerson = /* GraphQL */ `
  subscription OnCreatePerson($filter: ModelSubscriptionPersonFilterInput) {
    onCreatePerson(filter: $filter) {
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
export const onUpdatePerson = /* GraphQL */ `
  subscription OnUpdatePerson($filter: ModelSubscriptionPersonFilterInput) {
    onUpdatePerson(filter: $filter) {
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
export const onDeletePerson = /* GraphQL */ `
  subscription OnDeletePerson($filter: ModelSubscriptionPersonFilterInput) {
    onDeletePerson(filter: $filter) {
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
export const onCreateAccount = /* GraphQL */ `
  subscription OnCreateAccount($filter: ModelSubscriptionAccountFilterInput) {
    onCreateAccount(filter: $filter) {
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
export const onUpdateAccount = /* GraphQL */ `
  subscription OnUpdateAccount($filter: ModelSubscriptionAccountFilterInput) {
    onUpdateAccount(filter: $filter) {
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
export const onDeleteAccount = /* GraphQL */ `
  subscription OnDeleteAccount($filter: ModelSubscriptionAccountFilterInput) {
    onDeleteAccount(filter: $filter) {
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
export const onCreateProperty = /* GraphQL */ `
  subscription OnCreateProperty($filter: ModelSubscriptionPropertyFilterInput) {
    onCreateProperty(filter: $filter) {
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
export const onUpdateProperty = /* GraphQL */ `
  subscription OnUpdateProperty($filter: ModelSubscriptionPropertyFilterInput) {
    onUpdateProperty(filter: $filter) {
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
export const onDeleteProperty = /* GraphQL */ `
  subscription OnDeleteProperty($filter: ModelSubscriptionPropertyFilterInput) {
    onDeleteProperty(filter: $filter) {
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
export const onCreatePayment = /* GraphQL */ `
  subscription OnCreatePayment(
    $filter: ModelSubscriptionPaymentFilterInput
    $owner: String
  ) {
    onCreatePayment(filter: $filter, owner: $owner) {
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
export const onUpdatePayment = /* GraphQL */ `
  subscription OnUpdatePayment(
    $filter: ModelSubscriptionPaymentFilterInput
    $owner: String
  ) {
    onUpdatePayment(filter: $filter, owner: $owner) {
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
export const onDeletePayment = /* GraphQL */ `
  subscription OnDeletePayment(
    $filter: ModelSubscriptionPaymentFilterInput
    $owner: String
  ) {
    onDeletePayment(filter: $filter, owner: $owner) {
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
