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
