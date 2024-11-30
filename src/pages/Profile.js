import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROFILE } from '../queries/queries';
import './Profile.css';
import ProfileDisplay from '../components/profile/ProfileDisplay';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import NotificationModal from '../components/NotificationModal';

const Profile = ({ cognitoId }) => {
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
 
  const { loading, error, data } = useQuery(GET_PROFILE, {
    variables: { cognitoID: cognitoId }
  });

  const handleSave = (message, isError = false) => {
    setModalMessage(message);
    setShowModal(true);
    if (!isError) {
      setIsEditing(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;
  if (!data?.personByCognitoID?.items?.[0]) {
    return <div className="validation-message">Contact HOA Board to validate profile.</div>;
  }

  return (
    <div className="profile-container">
      {!isEditing && (
        <div className="profile-header">
          <h2>Profile Details</h2>
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        </div>
      )}
      {isEditing ? (
        <ProfileEditForm
          profile={data.personByCognitoID.items[0]}
          onCancel={() => setIsEditing(false)}
          onSave={handleSave}
        />
      ) : (
        <ProfileDisplay profile={data.personByCognitoID.items[0]} />
      )}
      {showModal && (
        <NotificationModal
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Profile;