import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PROPERTY, UPDATE_PROPERTY } from '../../queries/mutations';
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
  const [createProperty] = useMutation(CREATE_PROPERTY);

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

  const handleSubmit = async () => {
    if (!formData.address) {
      console.log('Address is required');
      return;
    }

    const input = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (property?.id) {
      await updateProperty({
        variables: { input: { id: property.id, ...input } }
      });
    } else {
      await createProperty({
        variables: { input }
      });
    }
    onClose();
  };

  const isCreating = !property?.id;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <h2>{isCreating ? 'Create New' : 'Edit'} Property</h2>
        <div className="form-container">
          <div className="form-section">
            <div className="form-group">
              <label>Property ID</label>
              <input 
                type="text" 
                value={formData.id} 
                disabled={!!property?.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Account ID</label>
              <input 
                type="text" 
                value={formData.accountPropertiesId} 
                onChange={(e) => setFormData({ ...formData, accountPropertiesId: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Tenant ID</label>
              <input 
                type="text" 
                value={formData.propertyTenantId} 
                onChange={(e) => setFormData({ ...formData, propertyTenantId: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Address*</label>
              <input 
                type="text" 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
              />
            </div>
          </div>
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
