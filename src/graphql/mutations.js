/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createProfile = /* GraphQL */ `
  mutation CreateProfile(
    $input: CreateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    createProfile(input: $input, condition: $condition) {
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
export const updateProfile = /* GraphQL */ `
  mutation UpdateProfile(
    $input: UpdateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    updateProfile(input: $input, condition: $condition) {
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
export const deleteProfile = /* GraphQL */ `
  mutation DeleteProfile(
    $input: DeleteProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    deleteProfile(input: $input, condition: $condition) {
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
export const createProperty = /* GraphQL */ `
  mutation CreateProperty(
    $input: CreatePropertyInput!
    $condition: ModelPropertyConditionInput
  ) {
    createProperty(input: $input, condition: $condition) {
      id
      type
      owner
      address
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
export const updateProperty = /* GraphQL */ `
  mutation UpdateProperty(
    $input: UpdatePropertyInput!
    $condition: ModelPropertyConditionInput
  ) {
    updateProperty(input: $input, condition: $condition) {
      id
      type
      owner
      address
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
export const deleteProperty = /* GraphQL */ `
  mutation DeleteProperty(
    $input: DeletePropertyInput!
    $condition: ModelPropertyConditionInput
  ) {
    deleteProperty(input: $input, condition: $condition) {
      id
      type
      owner
      address
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
export const createPayment = /* GraphQL */ `
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
export const updatePayment = /* GraphQL */ `
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
export const deletePayment = /* GraphQL */ `
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
export const createBulletin = /* GraphQL */ `
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
      type
      audience
      createdAt
      updatedAt
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
      type
      audience
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createPing = /* GraphQL */ `
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
      createdBy
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePing = /* GraphQL */ `
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
      createdBy
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePing = /* GraphQL */ `
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
      createdBy
      createdAt
      updatedAt
      __typename
    }
  }
`;
