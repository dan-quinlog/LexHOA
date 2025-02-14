import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { PROFILE_BY_COGNITO_ID } from '../../queries/queries';
import { UPDATE_PROFILE, CREATE_PING } from '../../queries/mutations';
import ProfileCard from '../../components/user/ProfileCard';
import PropertyCard from '../../components/user/PropertyCard';
import PingCard from '../../components/user/PingCard';
import ProfileEditModal from '../../components/shared/ProfileEditModal';
import AddPropertyRequestModal from '../../components/modals/AddPropertyRequestModal';
import './Profile.css';

const Profile = ({ cognitoId }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPropertyRequest, setShowPropertyRequest] = useState(false);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [createPing] = useMutation(CREATE_PING, {
    refetchQueries: [
      {
        query: PROFILE_BY_COGNITO_ID,
        variables: { cognitoID: cognitoId }
      }
    ]
  });

  const { data: profileData } = useQuery(PROFILE_BY_COGNITO_ID, {
    variables: { cognitoID: cognitoId },
    skip: !cognitoId
  });

  const profile = profileData?.profileByCognitoID?.items[0];

  const recentPings = useMemo(() => {
    const pings = profile?.createdPings?.items || [];
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return pings.filter(ping =>
      new Date(ping.createdAt) > oneMonthAgo
    );
  }, [profile]);

  const cleanFormData = (formData) => {
    return Object.entries(formData).reduce((acc, [key, value]) => {
      acc[key] = value === '' ? null : value;
      return acc;
    }, {});
  };

  const handleProfileUpdate = async (formData) => {
    const cleanedData = cleanFormData(formData);
    try {
      await updateProfile({
        variables: {
          input: {
            id: profile?.id,
            ...cleanedData
          }
        },
        refetchQueries: [
          {
            query: PROFILE_BY_COGNITO_ID,
            variables: { cognitoID: cognitoId }
          }
        ]
      });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCreatePing = async (propertyData) => {
    await createPing({
      variables: {
        input: {
          type: "PropertyRequest",
          items: [`profile:${profile.id}`, `property:${propertyData.selectedProperty.id}`],
          instruction: `Request to be added as ${propertyData.requestType} for property at ${propertyData.selectedProperty.address}`,
          profCreatorId: profile.id,
          status: "PENDING"
        }
      }
    });
    setShowPropertyRequest(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-cards">
        <div className="profile-header">
          <h2>Profile</h2>
          <div>
            <button onClick={() => setShowPropertyRequest(true)}>
              Add Property
            </button>
            <button
              className="edit-button"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {profile && (
          <>
            <AddPropertyRequestModal
              show={showPropertyRequest}
              onClose={() => setShowPropertyRequest(false)}
              onSubmit={handleCreatePing}
            />

            {profile?.createdPings?.items?.length > 0 && (
              <div className="pings-section">
                {profile.createdPings.items.map(ping => (
                  <PingCard key={ping.id} ping={ping} />
                ))}
              </div>
            )}

            <>
              <ProfileCard profile={profile} />
              <ProfileEditModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleProfileUpdate}
                initialValues={profile}
                isOwner={profile?.ownedProperties?.items?.length > 0}
                isBoard={false}
              />
            </>
              {profile?.ownedProperties?.items?.length > 0 && (
                <div className="property-section">
                  <h3>Owned Properties</h3>
                  {profile.ownedProperties.items.map(property => (
                    <PropertyCard 
                      key={property.id} 
                      property={property}
                      currentProfileId={profile.id} 
                    />
                  ))}
                </div>
              )}

              {profile?.tenantAt && (
                <div className="property-section">
                  <h3>Rented Property</h3>
                  <PropertyCard 
                    property={profile.tenantAt}
                    currentProfileId={profile.id}
                  />
                </div>
              )}

          </>
        )}
      </div>
    </div>
  );
};
export default Profile;