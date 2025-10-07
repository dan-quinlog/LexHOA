import { gql } from '@apollo/client';

// Get all documents (filtered by access level on frontend)
export const LIST_DOCUMENTS = gql`
  query ListDocuments(
    $filter: ModelDocumentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDocuments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
        uploadedById
        uploadedBy {
          id
          name
        }
        displayOrder
        year
        isArchived
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Get documents by category
export const DOCUMENTS_BY_CATEGORY = gql`
  query DocumentsByCategory(
    $category: DocumentCategory!
    $displayOrder: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelDocumentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    documentsByCategory(
      category: $category
      displayOrder: $displayOrder
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        uploadedById
        uploadedBy {
          id
          name
        }
        displayOrder
        year
        isArchived
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Get single document by ID
export const GET_DOCUMENT = gql`
  query GetDocument($id: ID!) {
    getDocument(id: $id) {
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
      uploadedById
      uploadedBy {
        id
        name
        email
      }
      displayOrder
      year
      isArchived
      createdAt
      updatedAt
    }
  }
`;

// Get documents sorted by date
export const DOCUMENTS_BY_DATE = gql`
  query DocumentsByDate(
    $type: String!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelDocumentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    documentsByDate(
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
        description
        category
        accessLevel
        fileName
        fileSize
        fileType
        s3Key
        s3Url
        uploadedById
        uploadedBy {
          id
          name
        }
        displayOrder
        year
        isArchived
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
