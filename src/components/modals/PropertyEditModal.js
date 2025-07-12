import React, { useState } from 'react';
import Modal from '../shared/Modal';
import './PropertyEditModal.css';

// Get group name from environment variable
const PRESIDENT_GROUP = process.env.REACT_APP_PRESIDENT_GROUP_NAME;

const PropertyEditModal = ({ show, onClose, onSubmit, initialValues = {}, userGroups = [] }) => {
  const [formData, setFormData] = useState({
    id: '',
    address: '',
    profOwnerId: '',
    profTenantId: '',
    ...initialValues
  });

  // Check if user has admin permissions (PRESIDENT only)
  const hasAdminPermission = userGroups && userGroups.includes(PRESIDENT_GROUP);

  const cleanFormData = (data) => {
    const cleaned = {};
    Object.entries(data).forEach(([key, value]) => {
      // Convert empty strings to null for ID fields to avoid DynamoDB errors
      if ((key === 'profOwnerId' || key === 'profTenantId') && value === '') {
        cleaned[key] = null;
      } else if (value !== '') {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  const handleSubmit = () => {
    if (!formData.address) {
      return;
    }
    const cleanedData = cleanFormData(formData);
    onSubmit(cleanedData);
  };

  return (
    <Modal show={show} onClose={onClose}>
      <h2>{initialValues?.id ? 'Edit' : 'Create New'} Property</h2>
      <div className="form-container">
        <div className="form-section">
          <div className="form-group">
            <label>Property ID</label>
            <input
              type="text"
              value={formData.id}
              disabled={!!initialValues?.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Owner ID</label>
            <input
              type="text"
              value={formData.profOwnerId}
              onChange={(e) => setFormData({ ...formData, profOwnerId: e.target.value })}
              placeholder="Leave blank if property has no owner"
            />
          </div>

          <div className="form-group">
            <label>Tenant ID</label>
            <input
              type="text"
              value={formData.profTenantId}
              onChange={(e) => setFormData({ ...formData, profTenantId: e.target.value })}
              placeholder="Leave blank if property is vacant"
            />
          </div>

          <div className="form-group">
            <label>Address*</label>
            <input
              type="text"
              value={formData.address}
              // Only allow PRESIDENT to edit the address
              readOnly={!hasAdminPermission}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={!hasAdminPermission ? "read-only-field" : ""}
            />
            {!hasAdminPermission && initialValues?.id && (
              <small className="field-note">Address can only be edited by the President</small>
            )}
          </div>
        </div>
      </div>
      <div className="modal-actions">
        <button onClick={handleSubmit}>
          {initialValues?.id ? 'Save' : 'Create'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};

export default PropertyEditModal;
