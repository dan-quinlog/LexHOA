/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createPerson = /* GraphQL */ `
  mutation CreatePerson(
    $input: CreatePersonInput!
    $condition: ModelPersonConditionInput
  ) {
    createPerson(input: $input, condition: $condition) {
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
export const updatePerson = /* GraphQL */ `
  mutation UpdatePerson(
    $input: UpdatePersonInput!
    $condition: ModelPersonConditionInput
  ) {
    updatePerson(input: $input, condition: $condition) {
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
export const deletePerson = /* GraphQL */ `
  mutation DeletePerson(
    $input: DeletePersonInput!
    $condition: ModelPersonConditionInput
  ) {
    deletePerson(input: $input, condition: $condition) {
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
export const createAccount = /* GraphQL */ `
  mutation CreateAccount(
    $input: CreateAccountInput!
    $condition: ModelAccountConditionInput
  ) {
    createAccount(input: $input, condition: $condition) {
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
export const updateAccount = /* GraphQL */ `
  mutation UpdateAccount(
    $input: UpdateAccountInput!
    $condition: ModelAccountConditionInput
  ) {
    updateAccount(input: $input, condition: $condition) {
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
export const deleteAccount = /* GraphQL */ `
  mutation DeleteAccount(
    $input: DeleteAccountInput!
    $condition: ModelAccountConditionInput
  ) {
    deleteAccount(input: $input, condition: $condition) {
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
export const createProperty = /* GraphQL */ `
  mutation CreateProperty(
    $input: CreatePropertyInput!
    $condition: ModelPropertyConditionInput
  ) {
    createProperty(input: $input, condition: $condition) {
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
export const updateProperty = /* GraphQL */ `
  mutation UpdateProperty(
    $input: UpdatePropertyInput!
    $condition: ModelPropertyConditionInput
  ) {
    updateProperty(input: $input, condition: $condition) {
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
export const deleteProperty = /* GraphQL */ `
  mutation DeleteProperty(
    $input: DeletePropertyInput!
    $condition: ModelPropertyConditionInput
  ) {
    deleteProperty(input: $input, condition: $condition) {
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
export const createPayment = /* GraphQL */ `
  mutation CreatePayment(
    $input: CreatePaymentInput!
    $condition: ModelPaymentConditionInput
  ) {
    createPayment(input: $input, condition: $condition) {
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
export const updatePayment = /* GraphQL */ `
  mutation UpdatePayment(
    $input: UpdatePaymentInput!
    $condition: ModelPaymentConditionInput
  ) {
    updatePayment(input: $input, condition: $condition) {
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
export const deletePayment = /* GraphQL */ `
  mutation DeletePayment(
    $input: DeletePaymentInput!
    $condition: ModelPaymentConditionInput
  ) {
    deletePayment(input: $input, condition: $condition) {
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
export const createBulletin = /* GraphQL */ `
  mutation CreateBulletin(
    $input: CreateBulletinInput!
    $condition: ModelBulletinConditionInput
  ) {
    createBulletin(input: $input, condition: $condition) {
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
export const updateBulletin = /* GraphQL */ `
  mutation UpdateBulletin(
    $input: UpdateBulletinInput!
    $condition: ModelBulletinConditionInput
  ) {
    updateBulletin(input: $input, condition: $condition) {
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
export const deleteBulletin = /* GraphQL */ `
  mutation DeleteBulletin(
    $input: DeleteBulletinInput!
    $condition: ModelBulletinConditionInput
  ) {
    deleteBulletin(input: $input, condition: $condition) {
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
