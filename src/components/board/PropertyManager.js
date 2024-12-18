import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { 
  SEARCH_PROPERTIES, 
  SEARCH_PROPERTIES_BY_ACCOUNT, 
  SEARCH_PROPERTIES_BY_TENANT 
} from '../../queries/queries';
import PropertyCard from './PropertyCard';
import PropertyEditModal from './PropertyEditModal';
import './PropertyManager.css';

const PropertyManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('propertyId');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [searchProperties] = useLazyQuery(SEARCH_PROPERTIES);
  const [searchByAccount] = useLazyQuery(SEARCH_PROPERTIES_BY_ACCOUNT);
  const [searchByTenant] = useLazyQuery(SEARCH_PROPERTIES_BY_TENANT);

  const handleSearch = async () => {
    if (!searchTerm) return;

    try {
      let response;
      switch(searchType) {
        case 'propertyId':
          response = await searchProperties({
            variables: { filter: { id: { contains: searchTerm } } }
          });
          setSearchResults(response.data?.listProperties?.items || []);
          break;
        case 'accountId':
          response = await searchByAccount({
            variables: { accountPropertiesId: searchTerm }
          });
          setSearchResults(response.data?.propertyByAccount?.items || []);
          break;
        case 'tenantId':
          response = await searchByTenant({
            variables: { propertyTenantId: searchTerm }
          });
          setSearchResults(response.data?.propertyByTenant?.items || []);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  return (
    <div className="property-manager">
      <h2 className="section-title">Property Search</h2>
      <div className="search-controls">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="search-type"
        >
          <option value="propertyId">Property ID</option>
          <option value="accountId">Account ID</option>
          <option value="tenantId">Tenant ID</option>
        </select>
        <input
          type="text"
          placeholder="Search Properties"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>
      
      <div className="properties-grid">
        {searchResults.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onEdit={() => handleEdit(property)}
          />
        ))}
      </div>

      {showEditModal && (
        <PropertyEditModal
          property={selectedProperty}
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            handleSearch(); // Refresh results after edit
          }}
        />
      )}
    </div>
  );
};

export default PropertyManager;