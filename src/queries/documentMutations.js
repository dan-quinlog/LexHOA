import { gql } from '@apollo/client';

// Create new document
export const CREATE_DOCUMENT = gql`
  mutation CreateDocument($input: CreateDocumentInput!) {
    createDocument(input: $input) {
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
      displayOrder
      year
      isArchived
      createdAt
      updatedAt
    }
  }
`;

// Update document metadata
export const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($input: UpdateDocumentInput!) {
    updateDocument(input: $input) {
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
      displayOrder
      year
      isArchived
      createdAt
      updatedAt
    }
  }
`;

// Delete document (soft delete by setting isArchived)
export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($input: DeleteDocumentInput!) {
    deleteDocument(input: $input) {
      id
      title
      isArchived
    }
  }
`;

// Archive document (soft delete)
export const ARCHIVE_DOCUMENT = gql`
  mutation ArchiveDocument($id: ID!) {
    updateDocument(input: { id: $id, isArchived: true }) {
      id
      title
      isArchived
      updatedAt
    }
  }
`;
