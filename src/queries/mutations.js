import { gql } from '@apollo/client';

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdatePersonInput!) {
    updatePerson(input: $input) {
      id
      name
      email
      address1
      address2
      city
      state
      zip
      phoneCall
      phoneText
      contactPref
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
      datePosted
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
      datePosted
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
