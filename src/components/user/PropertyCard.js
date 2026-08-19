import React, { useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_TENANT_TO_MY_PROPERTY, UPDATE_PROFILE } from '../../queries/mutations';
import { GET_TENANT_PROFILE } from '../../queries/queries';
import ProfileEditModal from '../shared/ProfileEditModal';
import './PropertyCard.css';
const PropertyCard = ({ property, currentProfileId, onTenantAdded }) => {
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [showEditTenantModal, setShowEditTenantModal] = useState(false);
  const [createTenantError, setCreateTenantError] = useState('');
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [createdTenant, setCreatedTenant] = useState(null);
  const createInFlight = useRef(false);
  const [addTenantToMyProperty] = useMutation(ADD_TENANT_TO_MY_PROPERTY);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const { data: tenantData } = useQuery(GET_TENANT_PROFILE, {
    variables: { id: property.profTenantId },
    skip: !property.profTenantId || Boolean(property.profTenant)
  });

  const isOwner = property.profOwnerId === currentProfileId;
  const tenant = property.profTenant || createdTenant || tenantData?.getProfile;

  const handleCreateTenant = async (formData) => {
    if (createInFlight.current) return;
    createInFlight.current = true;
    setIsCreatingTenant(true);
    setCreateTenantError('');

    try {
      const { name, email, phone, address, city, state, zip, contactPref, allowText } = formData;
      const result = await addTenantToMyProperty({
        variables: {
          input: {
            propertyId: property.id,
            name,
            email,
            phone,
            address,
            city,
            state,
            zip,
            contactPref,
            allowText
          }
        }
      });

      setCreatedTenant(result.data.addTenantToMyProperty);
      await onTenantAdded?.();
      setShowCreateTenantModal(false);
    } catch {
      setCreateTenantError('Unable to add tenant. Please try again.');
    } finally {
      createInFlight.current = false;
      setIsCreatingTenant(false);
    }
  };

  const handleUpdateTenant = async (formData) => {
    const { name, email, phone, address, city, state, zip, contactPref, allowText } = formData;

    await updateProfile({
      variables: {
        input: {
          id: tenant.id,
          name,
          email,
          phone,
          address,
          city,
          state,
          zip,
          contactPref,
          allowText
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
            tenant ? (
              <>
                <h4>Tenant Contact</h4>
                <p>Name: {tenant.name}</p>
                <p>Phone: {tenant.phone}</p>
                <p>Email: {tenant.email}</p>
                {!tenant.cognitoID && (
                  <button
                    className="edit-tenant-button"
                    onClick={() => setShowEditTenantModal(true)}
                  >
                    Update Tenant
                  </button>
                )}
              </>
            ) : property.profTenantId ? (
              <p>Loading tenant information...</p>
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
          submitError={createTenantError}
          isSubmitting={isCreatingTenant}
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
          initialValues={tenant}
          isOwner={false}
        />
      )}
    </div>
  );
};
export default PropertyCard;
