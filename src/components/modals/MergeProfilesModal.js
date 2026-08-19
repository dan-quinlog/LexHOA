import React, { useState } from 'react';
import Modal from '../shared/Modal';
import './MergeProfilesModal.css';

const MERGE_FIELDS = [
  'name',
  'email',
  'phone',
  'address',
  'city',
  'state',
  'zip',
  'contactPref',
  'billingFreq',
  'allowText',
  'balance'
];

const labels = {
  contactPref: 'Contact preference',
  billingFreq: 'Billing frequency',
  allowText: 'Allow text messages'
};

const displayValue = value => {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return value?.toString() || 'Empty';
};

const MergeProfilesModal = ({ profiles, show, onClose, onMerge, loading = false }) => {
  const cognitoProfile = profiles.find(p => p.cognitoID);
  const manualProfile = profiles.find(p => !p.cognitoID);

  const [selections, setSelections] = useState(() =>
    Object.fromEntries(MERGE_FIELDS.map(field => [field, 'COGNITO']))
  );

  const handleSelect = (field, source) => {
    setSelections(prev => ({
      ...prev,
      [field]: source
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
          {MERGE_FIELDS.map(field => (
            <div key={field} className="merge-field">
              <h4>{labels[field] || field.charAt(0).toUpperCase() + field.slice(1)}</h4>
              <div className="field-options">
                <label>
                  <input
                    type="radio"
                    name={field}
                    checked={selections[field] === 'COGNITO'}
                    onChange={() => handleSelect(field, 'COGNITO')}
                  />
                  {displayValue(cognitoProfile[field])}
                </label>
                <label>
                  <input
                    type="radio"
                    name={field}
                    checked={selections[field] === 'MANUAL'}
                    onChange={() => handleSelect(field, 'MANUAL')}
                  />
                  {displayValue(manualProfile[field])}
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button
            onClick={() => onMerge(cognitoProfile, manualProfile, selections)}
            className="merge-button"
            disabled={loading}
          >
            {loading ? 'Merging…' : 'Merge Profiles'}
          </button>
          <button onClick={onClose} className="cancel-button" disabled={loading}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};
export default MergeProfilesModal;
export { MERGE_FIELDS };
