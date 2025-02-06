import { gql } from '@apollo/client';

// Profile Mutations
export const CREATE_PROFILE = gql`
  mutation CreateProfile(
    $input: CreateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    createProfile(input: $input, condition: $condition) {
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
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $input: UpdateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    updateProfile(input: $input, condition: $condition) {
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
  }
`;

export const DELETE_PROFILE = gql`
  mutation DeleteProfile(
    $input: DeleteProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    deleteProfile(input: $input, condition: $condition) {
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
  }
`;

// Property Mutations
export const CREATE_PROPERTY = gql`
  mutation CreateProperty(
    $input: CreatePropertyInput!
    $condition: ModelPropertyConditionInput
  ) {
    createProperty(input: $input, condition: $condition) {
      id
      type
      address
      profOwnerId
      profTenantId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PROPERTY = gql`
  mutation UpdateProperty($input: UpdatePropertyInput!) {
    updateProperty(input: $input) {
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
        phone
      }
    }
  }
`;


export const DELETE_PROPERTY = gql`
  mutation DeleteProperty(
    $input: DeletePropertyInput!
    $condition: ModelPropertyConditionInput
  ) {
    deleteProperty(input: $input, condition: $condition) {
      id
      type
      address
      ownerId
      tenantId
      createdAt
      updatedAt
    }
  }
`;

// Payment Mutations
export const CREATE_PAYMENT = gql`
  mutation CreatePayment(
    $input: CreatePaymentInput!
    $condition: ModelPaymentConditionInput
  ) {
    createPayment(input: $input, condition: $condition) {
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
  }
`;

export const UPDATE_PAYMENT = gql`
  mutation UpdatePayment(
    $input: UpdatePaymentInput!
    $condition: ModelPaymentConditionInput
  ) {
    updatePayment(input: $input, condition: $condition) {
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
  }
`;

export const DELETE_PAYMENT = gql`
  mutation DeletePayment(
    $input: DeletePaymentInput!
    $condition: ModelPaymentConditionInput
  ) {
    deletePayment(input: $input, condition: $condition) {
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
  }
`;

// Bulletin Mutations
export const CREATE_BULLETIN = gql`
  mutation CreateBulletin(
    $input: CreateBulletinInput!
    $condition: ModelBulletinConditionInput
  ) {
    createBulletin(input: $input, condition: $condition) {
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

export const UPDATE_BULLETIN = gql`
  mutation UpdateBulletin(
    $input: UpdateBulletinInput!
    $condition: ModelBulletinConditionInput
  ) {
    updateBulletin(input: $input, condition: $condition) {
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

export const DELETE_BULLETIN = gql`
  mutation DeleteBulletin(
    $input: DeleteBulletinInput!
    $condition: ModelBulletinConditionInput
  ) {
    deleteBulletin(input: $input, condition: $condition) {
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
