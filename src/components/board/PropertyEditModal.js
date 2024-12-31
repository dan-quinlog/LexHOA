import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_PROPERTY } from '../../queries/mutations';
import './PropertyEditModal.css';

const PropertyEditModal = ({ property, onClose }) => {
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    id: property?.id,
    address: property?.address || '',
    accountPropertiesId: property?.accountPropertiesId || '',
    propertyTenantId: property?.propertyTenantId || ''
  });

  const [updateProperty] = useMutation(UPDATE_PROPERTY);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      await updateProperty({
        variables: {
          input: formData
        }
      });
      onClose();
    } catch (err) {
      console.error('Error updating property:', err);
    }
  };

  const isCreating = !property?.id;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <h2>{isCreating ? 'Create New' : 'Edit'} Property</h2>
        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Account ID</label>
          <input
            type="text"
            name="accountPropertiesId"
            value={formData.accountPropertiesId}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Tenant ID</label>
          <input
            type="text"
            name="propertyTenantId"
            value={formData.propertyTenantId}
            onChange={handleChange}
          />
        </div>
        <div className="modal-actions">
          <button onClick={handleSubmit}>
            {property?.id ? 'Save' : 'Create'}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyEditModal;
