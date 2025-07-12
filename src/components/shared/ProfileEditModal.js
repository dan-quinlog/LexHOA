import React, { useState } from 'react';
import Modal from './Modal';
import './ProfileEditModal.css';

const ProfileEditModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  initialValues = {}, 
  isOwner = false, 
  isBoard = false,
  hasBalanceEditPermission = false, // New prop for balance edit permission
  userGroups = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contactPref: 'EMAIL',
    billingFreq: 'MONTHLY',
    allowText: false,
    balance: 0,
    ...initialValues
  });

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = numbers.slice(0, 10);
    
    // Format as XXX-XXX-XXXX
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return limited;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <h2>{initialValues?.id ? 'Edit' : 'Create New'} Profile</h2>
      <div className="form-container">
        <div className="form-section">
          <div className="form-group">
            <label>Name*</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Email*</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={handlePhoneChange}
              placeholder="000-000-0000"
              maxLength="12"
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={formData.state || ''}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ZIP</label>
            <input
              type="text"
              value={formData.zip || ''}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Contact Preference</label>
            <select
              value={formData.contactPref || 'EMAIL'}
              onChange={(e) => setFormData({ ...formData, contactPref: e.target.value })}
            >
              <option value="EMAIL">Email</option>
              <option value="CALL">Call</option>
              <option value="TEXT">Text</option>
              <option value="PHYSICAL">Physical Mail</option>
            </select>
          </div>

          <div className="form-group">
            <label>Billing Frequency</label>
            <select
              value={formData.billingFreq || 'MONTHLY'}
              onChange={(e) => setFormData({ ...formData, billingFreq: e.target.value })}
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="SEMI">Semi-Annual</option>
              <option value="ANNUAL">Annual</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.allowText || false}
                onChange={(e) => setFormData({ ...formData, allowText: e.target.checked })}
              />
              Allow Text Messages
            </label>
          </div>

          <div className="form-group">
            <label>Balance</label>
            <input
              type="number"
              value={formData.balance || 0}
              onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
              // Only allow balance editing for users with permission
              readOnly={!hasBalanceEditPermission}
              className={!hasBalanceEditPermission ? "read-only-field" : ""}
            />
            {!hasBalanceEditPermission && (
              <small className="field-note">Balance can only be edited by the President or Treasurer</small>
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

export default ProfileEditModal;
