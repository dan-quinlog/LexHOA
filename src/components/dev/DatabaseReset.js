import React, { useState } from 'react';
import { useMutation, useQuery, gql, useApolloClient } from '@apollo/client';
import Modal from '../shared/Modal';
import {
  SEED_PROFILES,
  SEED_PROPERTIES,
  SEED_PAYMENTS,
  SEED_RELATIONSHIPS,
  SEED_BULLETINS
} from './seedData';
import {
  CREATE_PROFILE,
  CREATE_PROPERTY,
  CREATE_PAYMENT,
  CREATE_BULLETIN,
  DELETE_PROFILE,
  DELETE_PROPERTY,
  DELETE_PAYMENT,
  DELETE_BULLETIN,
  DELETE_PING,
  UPDATE_PROPERTY,
  UPDATE_PROFILE
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
  const client = useApolloClient();

  // Query hooks
  const { data: profileData } = useQuery(LIST_PROFILE_IDS);
  const { data: propertyData } = useQuery(LIST_PROPERTY_IDS);
  const { data: bulletinData } = useQuery(LIST_BULLETIN_IDS);
  const { data: paymentData } = useQuery(LIST_PAYMENT_IDS);
  const { data: pingData } = useQuery(LIST_PING_IDS);

  // Mutation hooks
  const [createProfile] = useMutation(CREATE_PROFILE);
  const [createProperty] = useMutation(CREATE_PROPERTY);
  const [createPayment] = useMutation(CREATE_PAYMENT);
  const [createBulletin] = useMutation(CREATE_BULLETIN);
  const [deleteProfile] = useMutation(DELETE_PROFILE);
  const [deleteProperty] = useMutation(DELETE_PROPERTY);
  const [deletePayment] = useMutation(DELETE_PAYMENT);
  const [deleteBulletin] = useMutation(DELETE_BULLETIN);
  const [deletePing] = useMutation(DELETE_PING);
  const [updateProperty] = useMutation(UPDATE_PROPERTY);
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  const deleteAllProperties = async () => {
    await Promise.all(
      propertyData?.listProperties?.items?.map(({ id }) =>
        deleteProperty({ variables: { input: { id } } })
      ) || []
    );
  };

  const deleteAllProfiles = async () => {
    await Promise.all(
      profileData?.listProfiles?.items?.map(({ id }) =>
        deleteProfile({ variables: { input: { id } } })
      ) || []
    );
  };

  const deleteAllPayments = async () => {
    await Promise.all(
      paymentData?.listPayments?.items?.map(({ id }) =>
        deletePayment({ variables: { input: { id } } })
      ) || []
    );
  };

  const deleteAllPings = async () => {
    await Promise.all(
      pingData?.listPings?.items?.map(({ id }) =>
        deletePing({ variables: { input: { id } } })
      ) || []
    );
  };

  const createAllProfiles = async () => {
    const createdProfiles = await Promise.all(
      SEED_PROFILES.map(profile =>
        createProfile({ variables: { input: profile } })
      )
    );
    return createdProfiles.map(result => result.data.createProfile);
  };

  const createAllProperties = async () => {
    const createdProperties = await Promise.all(
      SEED_PROPERTIES.map(property =>
        createProperty({ variables: { input: property } })
      )
    );
    return createdProperties.map(result => result.data.createProperty);
  };

  const createAllPayments = async () => {
    const createdPayments = await Promise.all(
      SEED_PAYMENTS.map(payment =>
        createPayment({ variables: { input: payment } })
      )
    );
    return createdPayments.map(result => result.data.createPayment);
  };

  const setupRelationships = async () => {
    await Promise.all(
      SEED_RELATIONSHIPS.map(async relationship => {
        // Update property with owner, owner field, and tenant
        await updateProperty({
          variables: {
            input: {
              id: relationship.propertyId,
              profOwnerId: relationship.profOwnerId,
              owner: relationship.profOwnerId,
              profTenantId: relationship.profTenantId
            }
          }
        });

        // Update tenant's profile with tenantAtId
        if (relationship.profTenantId) {
          await updateProfile({
            variables: {
              input: {
                id: relationship.profTenantId,
                tenantAtId: relationship.propertyId
              }
            }
          });
        }
      })
    );
  };
  const deleteAllBulletins = async () => {
    await Promise.all(
      bulletinData?.listBulletins?.items?.map(({ id }) =>
        deleteBulletin({ variables: { input: { id } } })
      ) || []
    );
  };

  const createAllBulletins = async () => {
    const createdBulletins = await Promise.all(
      SEED_BULLETINS.map(bulletin =>
        createBulletin({ variables: { input: bulletin } })
      )
    );
    return createdBulletins.map(result => result.data.createBulletin);
  };

  const handleReset = async () => {
    setShowModal(true);
    try {
      setStatus('Clearing database...');

      // Clear existing data first
      await deleteAllProperties();
      await deleteAllProfiles();
      await deleteAllPayments();
      await deleteAllBulletins();
      await deleteAllPings();

      // Reset cache after deletes
      await client.resetStore();

      // Create new data in order
      setStatus('Creating profiles...');
      await createAllProfiles();

      setStatus('Creating properties...');
      await createAllProperties();

      setStatus('Creating payments...');
      await createAllPayments();

      setStatus('Establishing relationships...');
      await setupRelationships();

      setStatus('Creating bulletins...');
      await createAllBulletins();

      setStatus('Reset complete!');
    } catch (error) {
      setStatus('Reset failed: ' + error.message);
    }

    setTimeout(() => {
      setShowModal(false);
      setStatus('');
    }, 2500);

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
