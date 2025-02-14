import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { LIST_PROPERTIES } from '../../queries/queries';
import Modal from '../shared/Modal';
import './AddPropertyRequestModal.css';

const AddPropertyRequestModal = ({ show, onClose, onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('address');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [requestType, setRequestType] = useState('owner');
  const [searchResults, setSearchResults] = useState([]);

  const [searchProperties] = useLazyQuery(LIST_PROPERTIES);

  const handleSearch = async () => {
    const response = await searchProperties({
      variables: {
        filter: {
          [searchType]: { contains: searchTerm }
        }
      }
    });
    setSearchResults(response.data?.listProperties?.items || []);
  };

  const handleSubmit = () => {
    onSubmit({
      selectedProperty,
      requestType
    });
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="property-request-modal">
        <h2>Request Property Association</h2>

        <div className="request-type-section">
          <label>Request Type:</label>
          <select value={requestType} onChange={e => setRequestType(e.target.value)}>
            <option value="owner">Owner</option>
            <option value="tenant">Tenant</option>
          </select>
        </div>

        <div className="search-section">
          <div className="search-controls">
            <select value={searchType} onChange={e => setSearchType(e.target.value)}>
              <option value="address">Address</option>
              <option value="id">Property ID</option>
            </select>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search properties..."
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="property-results">
            {searchResults.map(property => (
              <div
                key={property.id}
                className={`property-item ${selectedProperty?.id === property.id ? 'selected' : ''}`}
                onClick={() => setSelectedProperty(property)}
              >
                <span className="property-address">{property.address}</span>
                <span className="property-id">ID: {property.id}</span>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!selectedProperty}
          >
            Submit Request
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPropertyRequestModal;
