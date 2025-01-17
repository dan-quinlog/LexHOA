import { gql } from '@apollo/client';

export const UPDATE_PROFILE = gql`
  mutation UpdatePerson($input: UpdatePersonInput!) {
    updatePerson(input: $input) {
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
      createdAt
      updatedAt
      owner
    }
  }
`;

export const CREATE_BULLETIN = gql`
  mutation CreateBulletin($input: CreateBulletinInput!) {
    createBulletin(input: $input) {
      id
      title
      content
      audience
    }
  }
`;

export const UPDATE_BULLETIN = gql`
  mutation UpdateBulletin($input: UpdateBulletinInput!) {
    updateBulletin(input: $input) {
      id
      title
      content
      audience
    }
  }
`;

export const DELETE_BULLETIN = gql`
  mutation DeleteBulletin($input: DeleteBulletinInput!) {
    deleteBulletin(input: $input) {
      id
    }
  }
`;

export const UPDATE_ACCOUNT = gql`
  mutation UpdateAccount($input: UpdateAccountInput!) {
    updateAccount(input: $input) {
      id
      accountOwnerId
      accountName
      billingFreq
      balance
    }
  }
`;

export const UPDATE_PROPERTY = gql`
  mutation UpdateProperty($input: UpdatePropertyInput!) {
    updateProperty(input: $input) {
      id
      address
      accountPropertiesId
      propertyTenantId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PAYMENT = gql`
  mutation UpdatePayment($input: UpdatePaymentInput!) {
    updatePayment(input: $input) {
      id
      checkDate
      checkNumber
      checkAmount
      invoiceNumber
      invoiceAmount
      ownerPaymentsId
    }
  }
`;

export const CREATE_PERSON = gql`
  mutation CreatePerson($input: CreatePersonInput!) {
    createPerson(input: $input) {
      id
      name
      email
      phone
      cognitoID
      address
      city
      state
      zip
      allowText
      contactPref
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($input: UpdatePersonInput!) {
    updatePerson(input: $input) {
      id
      name
      email
      phone
      address
      city
      state
      zip
      allowText
      contactPref
      cognitoID
    }
  }
`;

export const DELETE_PERSON = gql`
  mutation DeletePerson($input: DeletePersonInput!) {
    deletePerson(input: $input) {
      id
    }
  }
`;

export const DELETE_PROFILE = gql`
  mutation DeleteProfile($input: DeleteProfileInput!) {
    deleteProfile(input: $input) {
      id
    }
  }
`;

export const CREATE_ACCOUNT = gql`
  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      accountOwnerId
      balance
      billingFreq
    }
  }
`;

export const CREATE_PROPERTY = gql`
  mutation CreateProperty($input: CreatePropertyInput!) {
    createProperty(input: $input) {
      id
      address
      accountPropertiesId
      propertyTenantId
    }
  }
`;

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      id
      checkNumber
      checkDate
      checkAmount
      invoiceNumber
      invoiceAmount
      ownerPaymentsId
    }
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($input: DeleteAccountInput!) {
    deleteAccount(input: $input) {
      id
    }
  }
`;

export const DELETE_PROPERTY = gql`
  mutation DeleteProperty($input: DeletePropertyInput!) {
    deleteProperty(input: $input) {
      id
    }
  }
`;

export const DELETE_PAYMENT = gql`
  mutation DeletePayment($input: DeletePaymentInput!) {
    deletePayment(input: $input) {
      id
    }
  }
`;
