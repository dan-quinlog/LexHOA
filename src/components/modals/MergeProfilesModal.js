import React, { useState } from 'react';
import Modal from '../shared/Modal';
import './MergeProfilesModal.css';

const MergeProfilesModal = ({ profiles, show, onClose, onMerge }) => {
  const cognitoProfile = profiles.find(p => p.cognitoID);
  const manualProfile = profiles.find(p => !p.cognitoID);

  const [mergedData, setMergedData] = useState({
    name: cognitoProfile?.name || '',
    email: cognitoProfile?.email || '',
    phone: cognitoProfile?.phone || '',
    address: cognitoProfile?.address || '',
    city: cognitoProfile?.city || '',
    state: cognitoProfile?.state || '',
    zip: cognitoProfile?.zip || '',
    contactPref: cognitoProfile?.contactPref || 'EMAIL'
  });

  const handleSelect = (field, value) => {
    setMergedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="merge-modal-content">
        <h2>Merge Profiles</h2>
        <div className="profiles-grid">
          <div className="profile-column">
            <h3>Cognito Profile</h3>
            <div className="profile-info">
              <p>ID: {cognitoProfile?.id}</p>
              <p>Cognito ID: {cognitoProfile?.cognitoID}</p>
            </div>
          </div>
          <div className="profile-column">
            <h3>Manual Profile</h3>
            <div className="profile-info">
              <p>ID: {manualProfile?.id}</p>
            </div>
          </div>
        </div>

        <div className="merge-fields">
          {Object.entries(mergedData).map(([field, value]) => (
            <div key={field} className="merge-field">
              <h4>{field.charAt(0).toUpperCase() + field.slice(1)}</h4>
              <div className="field-options">
                <label>
                  <input
                    type="radio"
                    name={field}
                    checked={value === cognitoProfile[field]}
                    onChange={() => handleSelect(field, cognitoProfile[field], cognitoProfile.id)}
                  />
                  {cognitoProfile[field]?.toString() || 'Empty'}
                </label>
                <label>
                  <input
                    type="radio"
                    name={field}
                    checked={value === manualProfile[field]}
                    onChange={() => handleSelect(field, manualProfile[field], manualProfile.id)}
                  />
                  {manualProfile[field]?.toString() || 'Empty'}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={() => onMerge(cognitoProfile, manualProfile, mergedData)} className="merge-button">
            Merge Profiles
          </button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </Modal>
  );
};
export default MergeProfilesModal;