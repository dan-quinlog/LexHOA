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

const PropertyManager = ({ searchState, setSearchState }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [searchProperties] = useLazyQuery(SEARCH_PROPERTIES);
  const [searchByAccount] = useLazyQuery(SEARCH_PROPERTIES_BY_ACCOUNT);
  const [searchByTenant] = useLazyQuery(SEARCH_PROPERTIES_BY_TENANT);

  const handleSearch = async () => {
    if (!searchState.searchTerm) return;

    try {
      let response;
      switch(searchState.searchType) {
        case 'propertyId':
          response = await searchProperties({
            variables: { filter: { id: { contains: searchState.searchTerm } } }
          });
          setSearchState({
            ...searchState,
            searchResults: response.data?.listProperties?.items || []
          });
          break;
        case 'accountId':
          response = await searchByAccount({
            variables: { accountPropertiesId: searchState.searchTerm }
          });
          setSearchState({
            ...searchState,
            searchResults: response.data?.propertyByAccount?.items || []
          });
          break;
        case 'tenantId':
          response = await searchByTenant({
            variables: { propertyTenantId: searchState.searchTerm }
          });
          setSearchState({
            ...searchState,
            searchResults: response.data?.propertyByTenant?.items || []
          });
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
          value={searchState.searchType}
          onChange={(e) => setSearchState({
            ...searchState,
            searchType: e.target.value
          })}
          className="search-type"
        >
          <option value="propertyId">Property ID</option>
          <option value="accountId">Account ID</option>
          <option value="tenantId">Tenant ID</option>
        </select>
        <input
          type="text"
          placeholder="Search Properties"
          value={searchState.searchTerm}
          onChange={(e) => setSearchState({
            ...searchState,
            searchTerm: e.target.value
          })}
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
        {searchState.searchResults.map((property) => (
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