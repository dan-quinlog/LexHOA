import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  SEARCH_PROPERTIES,
  SEARCH_PROPERTIES_BY_ACCOUNT,
  SEARCH_PROPERTIES_BY_TENANT
} from '../../queries/queries';
import { DELETE_PROPERTY } from '../../queries/mutations';
import PropertyCard from './PropertyCard';
import PropertyEditModal from './PropertyEditModal';
import './shared/BoardTools.css';
import BoardCard from './shared/BoardCard';
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal';

const PropertyManager = ({ searchState, setSearchState }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [properties, setProperties] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const [searchProperties] = useLazyQuery(SEARCH_PROPERTIES);
  const [searchByAccount] = useLazyQuery(SEARCH_PROPERTIES_BY_ACCOUNT);
  const [searchByTenant] = useLazyQuery(SEARCH_PROPERTIES_BY_TENANT);
  const [deleteProperty] = useMutation(DELETE_PROPERTY);

  const handleSearch = async () => {
    if (!searchState.searchTerm) return;

    try {
      let response;
      switch (searchState.searchType) {
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

  const handleDelete = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProperty({
        variables: { input: { id: propertyToDelete.id } }
      });
      setShowDeleteModal(false);
      setPropertyToDelete(null);
      handleSearch(); // Refresh the list
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  {
    showDeleteModal && (
      <DeleteConfirmationModal
        id={propertyToDelete?.id}
        onConfirm={confirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    )
  }

  return (
    <div className="board-tool">
      <h1 className="section-title">Property Search</h1>
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
        <button onClick={handleSearch}>Search</button>
        <button onClick={() => {
          setSelectedProperty(null);
          setShowEditModal(true);
        }}>Create New</button>
      </div>

      <div className="results-grid">
        {searchState.searchResults.map(property => (
          <BoardCard
            key={property.id}
            header={<h3>Property {property.id}</h3>}
            content={
              <>
                <div>Account: {property.accountPropertiesId}</div>
                <div>Tenant: {property.propertyTenantId}</div>
                <div>Address: {property.address}</div>
              </>
            }
            actions={
              <>
                <button onClick={() => handleEdit(property)}>Edit</button>
                <button onClick={() => handleDelete(property)}>Delete</button>
              </>
            }
          />
        ))}
      </div>
      {showEditModal && (
        <PropertyEditModal
          property={selectedProperty}
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            handleSearch();
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          id={propertyToDelete?.id}
          onConfirm={confirmDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};
export default PropertyManager;