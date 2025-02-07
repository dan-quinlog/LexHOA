import React, { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import Modal from '../shared/Modal';
import { testData } from './seedData';
import {
  CREATE_PROFILE,
  CREATE_PROPERTY,
  CREATE_BULLETIN,
  DELETE_PROFILE,
  DELETE_PROPERTY,
  DELETE_BULLETIN
} from '../../queries/mutations';

const LIST_PROFILE_IDS = gql`
  query ListProfiles {
    listProfiles {
      items {
        id
      }
    }
  }
`;

const LIST_PROPERTY_IDS = gql`
  query ListProperties {
    listProperties {
      items {
        id
      }
    }
  }
`;

const LIST_BULLETIN_IDS = gql`
  query ListBulletins {
    listBulletins {
      items {
        id
      }
    }
  }
`;

const LIST_PAYMENT_IDS = gql`
  query ListPayments {
    listPayments {
      items {
        id
      }
    }
  }
`;

const LIST_PING_IDS = gql`
  query ListPings {
    listPings {
      items {
        id
      }
    }
  }
`;


const DatabaseReset = () => {
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('');

  // Query hooks
  const { data: profileData } = useQuery(LIST_PROFILE_IDS);
  const { data: propertyData } = useQuery(LIST_PROPERTY_IDS);
  const { data: bulletinData } = useQuery(LIST_BULLETIN_IDS);
  const { data: paymentData } = useQuery(LIST_PAYMENT_IDS);
  const { data: pingData } = useQuery(LIST_PING_IDS);

  // Mutation hooks
  const [createProfile] = useMutation(CREATE_PROFILE);
  const [createProperty] = useMutation(CREATE_PROPERTY);
  const [createBulletin] = useMutation(CREATE_BULLETIN);
  const [deleteProfile] = useMutation(DELETE_PROFILE);
  const [deleteProperty] = useMutation(DELETE_PROPERTY);
  const [deleteBulletin] = useMutation(DELETE_BULLETIN);

  const handleReset = async () => {
    setShowModal(true);
    try {
      // Clear existing data
      setStatus('Clearing database...');

      // Delete profiles
      await Promise.all(
        profileData?.listProfiles?.items?.map(({ id }) =>
          deleteProfile({ variables: { input: { id } } })
        ) || []
      );

      // Delete properties
      await Promise.all(
        propertyData?.listProperties?.items?.map(({ id }) =>
          deleteProperty({ variables: { input: { id } } })
        ) || []
      );

      // Delete bulletins
      await Promise.all(
        bulletinData?.listBulletins?.items?.map(({ id }) =>
          deleteBulletin({ variables: { input: { id } } })
        ) || []
      );

      // Load new seed data
      setStatus('Loading new data...');
      setStatus('Loading profiles...');
      await Promise.all(testData.profiles.map(profile =>
        createProfile({ variables: { input: profile } })
      ));

      setStatus('Loading properties...');
      await Promise.all(testData.properties.map(property =>
        createProperty({ variables: { input: property } })
      ));

      setStatus('Loading bulletins...');
      await Promise.all(testData.bulletins.map(bulletin =>
        createBulletin({ variables: { input: bulletin } })
      ));

      setStatus('Database reset complete! This window will close automatically.');
      setTimeout(() => setShowModal(false), 3000);
    } catch (error) {
      setStatus(`Reset failed: ${error.message}`);
      console.error('Reset error:', error);
      setTimeout(() => setShowModal(false), 3000);
    }
  };

  return (
    <>
      <button onClick={handleReset}>Reset Database</button>
      <Modal
        show={showModal}
        onClose={() => { }}
        closeOnOutsideClick={false}
      >
        <div className="reset-status">
          <h3>Database Reset in Progress</h3>
          <p>{status}</p>
        </div>
      </Modal>
    </>
  );
};

export default DatabaseReset;