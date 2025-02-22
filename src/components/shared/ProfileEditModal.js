import React, { useState } from 'react';
import Modal from './Modal';
import { US_STATES } from '../../utils/constants';
import './ProfileEditModal.css';

const ProfileEditModal = ({
  show,
  onClose,
  onSubmit,
  initialValues = {},
  isBoard = false,
  isOwner = false
}) => {
  const [formData, setFormData] = useState({
    name: initialValues?.name || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    address: initialValues?.address || '',
    city: initialValues?.city || '',
    state: initialValues?.state || '',
    zip: initialValues?.zip || '',
    contactPref: initialValues?.contactPref || 'EMAIL',
    allowText: initialValues?.allowText || false,
    billingFreq: initialValues?.billingFreq || 'MONTHLY',
    balance: initialValues?.balance || 0.00
  });

  const handlePhoneChange = (e) => {
    const phoneNumber = e.target.value.replace(/\D/g, '');
    if (phoneNumber.length === 0) {
      handleContactField('phone', null);
    } else if (phoneNumber.length <= 10) {
      let formattedPhone = phoneNumber;
      if (phoneNumber.length > 3) {
        formattedPhone = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3);
      }
      if (phoneNumber.length > 6) {
        formattedPhone = formattedPhone.slice(0, 7) + '-' + formattedPhone.slice(7);
      }
      handleContactField('phone', formattedPhone);
    }
  };

  const handleAddressChange = (line1, line2) => {
    const newAddress = line1 + (line2 ? `|${line2}` : '');
    setFormData(prev => ({ ...prev, address: newAddress }));
  };

  const handleSubmit = () => {
    if (!formData.name) {
      return;
    }

    // Filter out empty string values and convert them to null
    const mutationData = Object.entries(formData).reduce((acc, [key, value]) => {
      // Skip balance field if not a board member
      if (!isBoard && key === 'balance') {
        return acc;
      }
      if (value === '') {
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {});

    onSubmit(mutationData);
  };

  const handleContactField = (field, value) => {
    setFormData({
      ...formData,
      [field]: value?.trim() === '' || value === null ? null : value
    });
  };

  return (
    <Modal show={show} onClose={onClose}>
      <h2>
        {initialValues?.id
          ? (isBoard ? 'Edit Resident' : 'Edit Profile')
          : 'Create New Person'}
      </h2>
      <div className="form-container">
        <div className="form-section">
          <h3>Primary Information</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Address Line 1</label>
            <input
              type="text"
              value={formData.address.split('|')[0]}
              onChange={(e) => handleAddressChange(e.target.value, formData.address.split('|')[1])}
            />
          </div>
          <div className="form-group">
            <label>Address Line 2</label>
            <input
              type="text"
              value={formData.address.split('|')[1] || ''}
              onChange={(e) => handleAddressChange(formData.address.split('|')[0], e.target.value)}
            />
          </div>
          <div className="address-line">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state.value} value={state.value}>{state.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>ZIP</label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleContactField('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={handlePhoneChange}
              placeholder="123-456-7890"
            />
          </div>
          <div className="form-group">
            <label>Contact Preference</label>
            <select
              value={formData.contactPref}
              onChange={(e) => setFormData({ ...formData, contactPref: e.target.value })}
            >
              <option value="EMAIL">Email</option>
              <option value="CALL">Phone</option>
              <option value="TEXT">Text</option>
              <option value="PHYSICAL">Traditional Mail</option>
            </select>
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.allowText}
                onChange={(e) => setFormData({ ...formData, allowText: e.target.checked })}
              />
              Allow Text Messages
            </label>
          </div>
          {isOwner && (
            <div className="form-group">
              <label>Billing Frequency</label>
              <select
                value={formData.billingFreq || ''}
                onChange={(e) => setFormData({ ...formData, billingFreq: e.target.value })}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="SEMI">Semi-Annual</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
          )}
          {isOwner && (
            <div className="form-group">
              <label>Balance</label>
              <input
                type="number"
                step="0.01"
                value={Number(formData.balance).toFixed(2)}
                onChange={(e) => setFormData({
                  ...formData,
                  balance: Number(parseFloat(e.target.value).toFixed(2))
                })}
                disabled={!isBoard}
              />
            </div>
          )}
        </div>
      </div>
      <div className="modal-actions">
        <button onClick={handleSubmit}>
          {initialValues?.id ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};

export default ProfileEditModal;
