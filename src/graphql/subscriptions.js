/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreatePerson = /* GraphQL */ `
  subscription OnCreatePerson(
    $filter: ModelSubscriptionPersonFilterInput
    $owner: String
  ) {
    onCreatePerson(filter: $filter, owner: $owner) {
      id
      name
      cognitoID
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
export const onUpdatePerson = /* GraphQL */ `
  subscription OnUpdatePerson(
    $filter: ModelSubscriptionPersonFilterInput
    $owner: String
  ) {
    onUpdatePerson(filter: $filter, owner: $owner) {
      id
      name
      cognitoID
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
export const onDeletePerson = /* GraphQL */ `
  subscription OnDeletePerson(
    $filter: ModelSubscriptionPersonFilterInput
    $owner: String
  ) {
    onDeletePerson(filter: $filter, owner: $owner) {
      id
      name
      cognitoID
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
export const onCreateAccount = /* GraphQL */ `
  subscription OnCreateAccount(
    $filter: ModelSubscriptionAccountFilterInput
    $owner: String
  ) {
    onCreateAccount(filter: $filter, owner: $owner) {
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
export const onUpdateAccount = /* GraphQL */ `
  subscription OnUpdateAccount(
    $filter: ModelSubscriptionAccountFilterInput
    $owner: String
  ) {
    onUpdateAccount(filter: $filter, owner: $owner) {
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
export const onDeleteAccount = /* GraphQL */ `
  subscription OnDeleteAccount(
    $filter: ModelSubscriptionAccountFilterInput
    $owner: String
  ) {
    onDeleteAccount(filter: $filter, owner: $owner) {
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
export const onCreateProperty = /* GraphQL */ `
  subscription OnCreateProperty(
    $filter: ModelSubscriptionPropertyFilterInput
    $owner: String
  ) {
    onCreateProperty(filter: $filter, owner: $owner) {
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
  subscription OnUpdateProperty(
    $filter: ModelSubscriptionPropertyFilterInput
    $owner: String
  ) {
    onUpdateProperty(filter: $filter, owner: $owner) {
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
  subscription OnDeleteProperty(
    $filter: ModelSubscriptionPropertyFilterInput
    $owner: String
  ) {
    onDeleteProperty(filter: $filter, owner: $owner) {
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
      bulletin
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
export const onUpdateBulletin = /* GraphQL */ `
  subscription OnUpdateBulletin($filter: ModelSubscriptionBulletinFilterInput) {
    onUpdateBulletin(filter: $filter) {
      id
      bulletin
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
export const onDeleteBulletin = /* GraphQL */ `
  subscription OnDeleteBulletin($filter: ModelSubscriptionBulletinFilterInput) {
    onDeleteBulletin(filter: $filter) {
      id
      bulletin
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
