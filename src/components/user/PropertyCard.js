import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PROFILE, UPDATE_PROPERTY } from '../../queries/mutations';
import ProfileEditModal from '../shared/ProfileEditModal';
import './PropertyCard.css';
const PropertyCard = ({ property }) => {
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [createProfile] = useMutation(CREATE_PROFILE);
  const [updateProperty] = useMutation(UPDATE_PROPERTY);

  const handleCreateTenant = async (formData) => {
    const newProfile = await createProfile({
      variables: {
        input: {
          type: 'TENANT',
          ...formData
        }
      }
    });

    await updateProperty({
      variables: {
        input: {
          id: property.id,
          tenantId: newProfile.data.createProfile.id
        }
      }
    });
  };

  return (
    <div className="user-card property-card">
      <div className="card-content two-column">
        <div className="left-column">
          <h3>Property Information</h3>
          <p>Address: {property.address}</p>
          <p>Property ID: {property.id}</p>
          <p>Type: {property.type}</p>
        </div>
        <div className="right-column">
          <h3>Tenant Information</h3>
          {property.tenant ? (
            <>
              <p>Name: {property.tenant.name}</p>
              <p>Phone: {property.tenant.phone}</p>
            </>
          ) : (
            <button
              className="add-tenant-button"
              onClick={() => setShowCreateTenantModal(true)}
            >
              Add Tenant
            </button>
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
    </div>
  );
};

export default PropertyCard;

