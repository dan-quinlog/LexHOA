  import React, { useState } from 'react';
  import { useQuery, useMutation } from '@apollo/client';
  import { PROFILE_BY_COGNITO_ID } from '../../queries/queries';
  import { UPDATE_PROFILE } from '../../queries/mutations';
  import ProfileCard from '../../components/user/ProfileCard';
  import PropertyCard from '../../components/user/PropertyCard';
  import ProfileEditModal from '../../components/shared/ProfileEditModal';
  import './Profile.css';

  const Profile = ({ cognitoId }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [updateProfile] = useMutation(UPDATE_PROFILE);

    const { data: profileData } = useQuery(PROFILE_BY_COGNITO_ID, {
      variables: { cognitoID: cognitoId },
      skip: !cognitoId
    });

    const profile = profileData?.profileByCognitoID?.items[0];

    const handleProfileUpdate = async (formData) => {
      await updateProfile({
        variables: {
          input: {
            id: profile.id,
            ...formData
          }
        }
      });
      setShowEditModal(false);
    };

    return (
      <div className="profile-page">
        <div className="profile-cards">
          <div className="profile-header">
            <h2>Profile</h2>
            <button
              className="edit-button"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
          </div>
     
          {profile && (
            <>
              <ProfileCard profile={profile} />
              <ProfileEditModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleProfileUpdate}
                initialValues={profile}
                isBoard={true}
              />
            </>
          )}

          {profile?.ownedProperties?.items?.length > 0 && (
            <div className="property-section">
              <h3>Owned Properties</h3>
              {profile.ownedProperties.items.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {profile?.tenantAt && (
            <div className="property-section">
              <h3>Rented Property</h3>
              <PropertyCard property={profile.tenantAt} />
            </div>
          )}
        </div>
      </div>
    );
  };

  export default Profile;