import { gql } from '@apollo/client';

// Profile Mutations
export const CREATE_PROFILE = gql`
  mutation CreateProfile(
    $input: CreateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    createProfile(input: $input, condition: $condition) {
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
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $input: UpdateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    updateProfile(input: $input, condition: $condition) {
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
      allowText
      billingFreq
      balance
      tenantAtId
      createdAt
      updatedAt
      owner
      ownedProperties {
        items {
          id
          profOwnerId
        }
      }
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
  mutation UpdateProperty(
    $input: UpdatePropertyInput!
    $condition: ModelPropertyConditionInput
  ) {
    updateProperty(input: $input, condition: $condition) {
      id
      type
      owner
      address
      profOwnerId
      profTenantId
      createdAt
      updatedAt
      profOwner {
        id
        name
        phone
      }
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
      profOwnerId
      profTenantId
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
      byTypeCreatedAt
      byTypeCheckDate
      byTypeInvoiceNumber
      checkDate
      checkNumber
      checkAmount
      invoiceNumber
      invoiceAmount
      paymentMethod
      stripePaymentIntentId
      stripeCustomerId
      amount
      processingFee
      totalAmount
      status
      description
      ownerPaymentsId
      createdAt
      updatedAt
      owner
    }
  }
`;

// Stripe Mutations
export const CREATE_STRIPE_PAYMENT_INTENT = gql`
  mutation CreateStripePaymentIntent($amount: Float!, $profileId: ID!, $description: String, $email: String, $paymentMethodType: String) {
    createStripePaymentIntent(amount: $amount, profileId: $profileId, description: $description, email: $email, paymentMethodType: $paymentMethodType) {
      clientSecret
      paymentIntentId
      amount
      processingFee
      totalAmount
      paymentMethodType
    }
  }
`;

export const CREATE_STRIPE_CUSTOMER = gql`
  mutation CreateStripeCustomer($profileId: ID!, $email: String!, $name: String!) {
    createStripeCustomer(profileId: $profileId, email: $email, name: $name) {
      customerId
      success
      message
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
  }
`;

export const DELETE_PAYMENT = gql`
  mutation DeletePayment(
    $input: DeletePaymentInput!
    $condition: ModelPaymentConditionInput
  ) {
    deletePayment(input: $input, condition: $condition) {
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

export const CREATE_PING = gql`
  mutation CreatePing(
    $input: CreatePingInput!
    $condition: ModelPingConditionInput
  ) {
    createPing(input: $input, condition: $condition) {
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

export const UPDATE_PING = gql`
  mutation UpdatePing(
    $input: UpdatePingInput!
    $condition: ModelPingConditionInput
  ) {
    updatePing(input: $input, condition: $condition) {
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

export const DELETE_PING = gql`
  mutation DeletePing(
    $input: DeletePingInput!
    $condition: ModelPingConditionInput
  ) {
    deletePing(input: $input, condition: $condition) {
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

export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument(
    $input: UpdateDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    updateDocument(input: $input, condition: $condition) {
      id
      title
      uploadedById
      createdAt
      updatedAt
    }
  }
`;
