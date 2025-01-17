import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_PERSON } from '../../queries/mutations';
import Modal from '../shared/Modal';
import { US_STATES } from '../../utils/constants';
import './ProfileEditModal.css';
import '../user/UserCards.css';

const ProfileEditModal = ({ person, show, onClose }) => {
  const [formData, setFormData] = useState({
    name: person?.name || '',
    email: person?.email || '',
    phone: person?.phone || '',
    address: person?.address || '',
    city: person?.city || '',
    state: person?.state || '',
    zip: person?.zip || '',
    allowText: person?.allowText || false,
    contactPref: person?.contactPref || ''
  });

  const [updatePerson] = useMutation(UPDATE_PERSON);

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
      await updatePerson({
        variables: {
          input: {
            id: person.id,
            ...formData
          }
        }
      });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <h2>Edit Profile</h2>
      <div className="form-container two-column">
        <div className="left-column">
          <div className="profile-form-group">
            <label>Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="profile-form-group">
            <label>Address Line 1</label>
            <input 
              type="text"
              value={formData.address.split('|')[0] || ''}
              onChange={(e) => handleAddressChange(e.target.value, formData.address.split('|')[1])}
            />
          </div>
          <div className="profile-form-group">
            <label>Address Line 2</label>
            <input 
              type="text"
              value={formData.address.split('|')[1] || ''}
              onChange={(e) => handleAddressChange(formData.address.split('|')[0], e.target.value)}
            />
          </div>
          <div className="address-line">
            <div className="profile-form-group">
              <label>City</label>
              <input 
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="profile-form-group">
              <label>State</label>
              <select 
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="profile-form-group">
              <label>ZIP</label>
              <input 
                type="text"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="right-column">
          <div className="profile-form-group">
            <label>Phone</label>
            <input 
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="123-456-7890"
            />
          </div>
          <div className="profile-form-group">
            <label>Email</label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="profile-form-group">
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
          <div className="profile-form-group profile-checkbox-group">
            <input 
              type="checkbox"
              checked={formData.allowText}
              onChange={(e) => setFormData({ ...formData, allowText: e.target.checked })}
            />
            <label>Allow Text Messages</label>
          </div>
        </div>
      </div>
      <div className="modal-actions">
        <button onClick={handleSubmit}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};

export default ProfileEditModal;

