import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { PROFILE_BY_COGNITO_ID } from '../../queries/queries';
import { UPDATE_PROFILE, CREATE_PING } from '../../queries/mutations';
import ProfileCard from '../../components/user/ProfileCard';
import PropertyCard from '../../components/user/PropertyCard';
import PingCard from '../../components/user/PingCard';
import Modal from '../../components/shared/Modal';
import ProfileEditModal from '../../components/shared/ProfileEditModal';
import NotificationModal from '../../components/modals/NotificationModal';
import AddPropertyRequestModal from '../../components/modals/AddPropertyRequestModal';
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth';
import { verifyNewEmail } from '../../utils/cognitoUtils';
import './Profile.css';

const Profile = ({ cognitoId }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPropertyRequest, setShowPropertyRequest] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [verificationError, setVerificationError] = useState('');
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

  const handleProfileUpdate = async (formData, newEmailToVerify) => {
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

      if (newEmailToVerify) {
        setNewEmail(newEmailToVerify);
        setPendingEmailVerification(true);
      }

      setShowEditModal(false);
    } catch (error) {
      setNotificationMessage(
        'You do not have permission to perform this action. Please contact a board member for assistance.'
      );
      setShowNotification(true);
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

  useEffect(() => {
    const checkPendingVerification = async () => {
      try {
        await getCurrentUser();
        const userAttributes = await fetchUserAttributes();

        if (userAttributes.email_verified === 'false') {
          setPendingEmailVerification(true);

          if (userAttributes.email) {
            setNewEmail(userAttributes.email);
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    if (cognitoId) {
      checkPendingVerification();
    }
  }, [cognitoId]);

  const handleVerificationSubmit = async () => {
    try {
      setVerificationError('');
      await verifyNewEmail(verificationCode);

      if (profile) {
        await updateProfile({
          variables: {
            input: {
              id: profile.id,
              email: newEmail
            }
          },
          refetchQueries: [
            {
              query: PROFILE_BY_COGNITO_ID,
              variables: { cognitoID: cognitoId }
            }
          ]
        });
      }

      setPendingEmailVerification(false);
      setNotificationMessage('Email successfully verified!');
      setShowNotification(true);
    } catch (error) {
      console.error('Error verifying email:', error);
      setVerificationError(error.message || 'Failed to verify email');
    }
  };

  const EmailVerificationModal = () => (
    <Modal show={pendingEmailVerification} onClose={() => setPendingEmailVerification(false)}>
      <h2>Verify Your New Email</h2>
      <p>A verification code has been sent to {newEmail}. Please enter it below to complete your email update.</p>

      {verificationError && <div className="error-message">{verificationError}</div>}

      <div className="form-group">
        <label>Verification Code</label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter verification code"
          required
        />
      </div>

      <div className="modal-actions">
        <button onClick={handleVerificationSubmit}>
          Verify Email
        </button>
        <button type="button" onClick={() => setPendingEmailVerification(false)}>
          Cancel
        </button>
      </div>
    </Modal>
  );

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

        {showNotification && (
          <NotificationModal
            show={true}
            message={notificationMessage}
            onClose={() => setShowNotification(false)}
          />
        )}

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

            <ProfileCard profile={profile} />
            {showEditModal && (
              <ProfileEditModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleProfileUpdate}
                initialValues={profile}
                isOwner={profile?.ownedProperties?.items?.length > 0}
                isBoard={false}
              />
            )}

            {pendingEmailVerification && <EmailVerificationModal />}

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
            {profile.tenantAt && profile.tenantAt.profOwnerId !== profile.id && (
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