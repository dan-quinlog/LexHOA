/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const manageCognitoGroups = /* GraphQL */ `
  mutation ManageCognitoGroups(
    $action: String!
    $groupName: String!
    $cognitoId: String!
  ) {
    manageCognitoGroups(
      action: $action
      groupName: $groupName
      cognitoId: $cognitoId
    ) {
      success
      message
      __typename
    }
  }
`;
export const processMonthlyPropertyDues = /* GraphQL */ `
  mutation ProcessMonthlyPropertyDues {
    processMonthlyPropertyDues {
      success
      message
      __typename
    }
  }
`;
export const createStripePaymentIntent = /* GraphQL */ `
  mutation CreateStripePaymentIntent(
    $amount: Float!
    $profileId: ID!
    $description: String
  ) {
    createStripePaymentIntent(
      amount: $amount
      profileId: $profileId
      description: $description
    ) {
      clientSecret
      paymentIntentId
      amount
      processingFee
      totalAmount
      __typename
    }
  }
`;
export const createStripeCustomer = /* GraphQL */ `
  mutation CreateStripeCustomer(
    $profileId: ID!
    $email: String!
    $name: String!
  ) {
    createStripeCustomer(profileId: $profileId, email: $email, name: $name) {
      customerId
      success
      message
      __typename
    }
  }
`;
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
      stripeCustomerId
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
      uploadedDocuments {
        nextToken
        __typename
      }
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
      stripeCustomerId
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
      uploadedDocuments {
        nextToken
        __typename
      }
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
      stripeCustomerId
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
      uploadedDocuments {
        nextToken
        __typename
      }
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
        stripeCustomerId
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
        stripeCustomerId
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
        stripeCustomerId
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
        stripeCustomerId
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
        stripeCustomerId
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
        stripeCustomerId
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
      paymentMethod
      stripePaymentIntentId
      stripeCustomerId
      amount
      processingFee
      totalAmount
      status
      description
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
        stripeCustomerId
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
      paymentMethod
      stripePaymentIntentId
      stripeCustomerId
      amount
      processingFee
      totalAmount
      status
      description
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
        stripeCustomerId
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
      paymentMethod
      stripePaymentIntentId
      stripeCustomerId
      amount
      processingFee
      totalAmount
      status
      description
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
        stripeCustomerId
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
        stripeCustomerId
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
        stripeCustomerId
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
        stripeCustomerId
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
export const createDocument = /* GraphQL */ `
  mutation CreateDocument(
    $input: CreateDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    createDocument(input: $input, condition: $condition) {
      id
      title
      description
      category
      accessLevel
      fileName
      fileSize
      fileType
      s3Key
      s3Url
      uploadedBy {
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
        stripeCustomerId
        tenantAtId
        createdAt
        updatedAt
        __typename
      }
      uploadedById
      displayOrder
      year
      isArchived
      type
      categoryIndex
      accessLevelIndex
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const updateDocument = /* GraphQL */ `
  mutation UpdateDocument(
    $input: UpdateDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    updateDocument(input: $input, condition: $condition) {
      id
      title
      description
      category
      accessLevel
      fileName
      fileSize
      fileType
      s3Key
      s3Url
      uploadedBy {
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
        stripeCustomerId
        tenantAtId
        createdAt
        updatedAt
        __typename
      }
      uploadedById
      displayOrder
      year
      isArchived
      type
      categoryIndex
      accessLevelIndex
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const deleteDocument = /* GraphQL */ `
  mutation DeleteDocument(
    $input: DeleteDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    deleteDocument(input: $input, condition: $condition) {
      id
      title
      description
      category
      accessLevel
      fileName
      fileSize
      fileType
      s3Key
      s3Url
      uploadedBy {
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
        stripeCustomerId
        tenantAtId
        createdAt
        updatedAt
        __typename
      }
      uploadedById
      displayOrder
      year
      isArchived
      type
      categoryIndex
      accessLevelIndex
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
