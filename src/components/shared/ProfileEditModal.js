import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PROFILE, UPDATE_PROFILE } from '../../queries/mutations';
import Modal from './Modal';
import { US_STATES } from '../../utils/constants';
import './ProfileEditModal.css';

const ProfileEditModal = ({ person, show, onClose, isBoard = false }) => {
  const [formData, setFormData] = useState({
    name: person?.name || '',
    email: person?.email || '',
    phone: person?.phone || '',
    cognitoID: person?.cognitoID || '',
    address: person?.address || '',
    city: person?.city || '',
    state: person?.state || '',
    zip: person?.zip || '',
    allowText: person?.allowText || false,
    contactPref: person?.contactPref || '',
    billingFreq: person?.billingFreq || ''
  });

  const [createPerson] = useMutation(CREATE_PROFILE);
  const [updatePerson] = useMutation(UPDATE_PROFILE);

  const handlePhoneChange = (e) => {
    const phoneNumber = e.target.value.replace(/\D/g, '');
    if (phoneNumber.length <= 10) {
      setFormData({
        ...formData,
        phone: phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
      });
    }
  };

  const handleAddressChange = (line1, line2) => {
    const newAddress = line1 + (line2 ? `|${line2}` : '');
    setFormData(prev => ({ ...prev, address: newAddress }));
  };

  const handleSubmit = async () => {
    try {
      const input = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      if (!input.name) {
        console.error('Name is required');
        return;
      }

      if (person?.id) {
        await updatePerson({
          variables: {
            input: {
              id: person.id,
              ...input
            }
          }
        });
      } else {
        await createPerson({
          variables: {
            input
          }
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving person:', error);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <h2>{person?.id ? (isBoard ? 'Edit Resident' : 'Edit Profile') : 'Create New Person'}</h2>
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
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
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
              <option value="PHONE">Phone</option>
              <option value="TEXT">Text</option>
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
          {isBoard && (
            <div className="form-group">
              <label>Billing Frequency</label>
              <select
                value={formData.billingFreq || ''}
                onChange={(e) => setFormData({ ...formData, billingFreq: e.target.value })}
              >
                <option value="">Select Frequency</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="SEMI">Semi-Annual</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="modal-actions">
        <button onClick={handleSubmit}>{person?.id ? 'Save' : 'Create'}</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};

export default ProfileEditModal;
