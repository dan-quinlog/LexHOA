import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PROFILE, UPDATE_PROFILE, UPDATE_PROPERTY } from '../../queries/mutations';
import ProfileEditModal from '../shared/ProfileEditModal';
import './PropertyCard.css';
const PropertyCard = ({ property, currentProfileId }) => {
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [showEditTenantModal, setShowEditTenantModal] = useState(false);
  const [createProfile] = useMutation(CREATE_PROFILE);
  const [updateProperty] = useMutation(UPDATE_PROPERTY);
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  const isTenantCurrentUser = property.profTenant?.owner === currentProfileId;
  const isOwner = property.profOwnerId === currentProfileId;

  const handleCreateTenant = async (formData) => {
    const newProfile = await createProfile({
      variables: {
        input: {
          ...formData,
          owner: currentProfileId
        }
      }
    });

    await updateProperty({
      variables: {
        input: {
          id: property.id,
          profTenantId: newProfile.data.createProfile.id
        }
      }
    });

    setShowCreateTenantModal(false);
  };

  const handleUpdateTenant = async (formData) => {
    const { owner, __typename, balance, ...updateData } = formData;

    await updateProfile({
      variables: {
        input: {
          id: property.profTenant.id,
          ...updateData
        }
      }
    });
    setShowEditTenantModal(false);
  };

  return (
    <div className="user-card property-card">
      <div className="card-content two-column">
        <div className="left-column">
          <h3>Property Information</h3>
          <p>Property ID: {property.id}</p>
          <p>Address: {property.address}</p>
          <p>{property.city}, {property.state} {property.zip}</p>
        </div>
        <div className="right-column">
          {isOwner ? (
            property.profTenant ? (
              <>
                <h4>Tenant Contact</h4>
                <p>Name: {property.profTenant.name}</p>
                <p>Phone: {property.profTenant.phone}</p>
                <p>Email: {property.profTenant.email}</p>
                {property.profTenant.owner === currentProfileId && (
                  <button
                    className="edit-tenant-button"
                    onClick={() => setShowEditTenantModal(true)}
                  >
                    Update Tenant
                  </button>
                )}
              </>
            ) : (
              <button
                className="add-tenant-button"
                onClick={() => setShowCreateTenantModal(true)}
              >
                Add Tenant
              </button>
            )
          ) : (
            <>
              <h4>Owner Contact</h4>
              <p>Name: {property.profOwner.name}</p>
              {property.profOwner.contactPref === 'CALL' && property.profOwner.phone && (
                <p>Phone: {property.profOwner.phone}</p>
              )}
              {property.profOwner.contactPref === 'TEXT' && property.profOwner.phone && (
                <p>Phone: {property.profOwner.phone}</p>
              )}
              {property.profOwner.contactPref === 'EMAIL' && property.profOwner.email && (
                <p>Email: {property.profOwner.email}</p>
              )}
              {property.profOwner.contactPref === 'PHYSICAL' && property.profOwner.address && (
                <div>
                  <p>Mailing Address: {property.profOwner.address}</p>
                  <p>{property.profOwner.city}, {property.profOwner.state} {property.profOwner.zip}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {showCreateTenantModal && (
        <ProfileEditModal
          show={showCreateTenantModal}
          onClose={() => setShowCreateTenantModal(false)}
          onSubmit={handleCreateTenant}
          initialValues={{
            address: property.address,
            city: property.city,
            state: property.state,
            zip: property.zip
          }}
        />
      )}

      {showEditTenantModal && (
        <ProfileEditModal
          show={showEditTenantModal}
          onClose={() => setShowEditTenantModal(false)}
          onSubmit={handleUpdateTenant}
          initialValues={property.profTenant}
          isOwner={false}
        />
      )}
    </div>
  );
};
export default PropertyCard;

