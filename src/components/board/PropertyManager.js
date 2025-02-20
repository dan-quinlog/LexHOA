import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  LIST_PROPERTIES,
  PROPERTY_BY_ADDRESS
} from '../../queries/queries';
import {
  DELETE_PROPERTY,
  CREATE_PROPERTY,
  UPDATE_PROPERTY,
  UPDATE_PROFILE
} from '../../queries/mutations';
import PropertyEditModal from '../modals/PropertyEditModal';
import BoardCard from './shared/BoardCard';
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal';
import './shared/BoardTools.css';

const PropertyManager = ({ searchState, setSearchState }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [properties, setProperties] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const [searchProperties] = useLazyQuery(LIST_PROPERTIES);
  const [searchByAddress] = useLazyQuery(PROPERTY_BY_ADDRESS);
  const [deleteProperty] = useMutation(DELETE_PROPERTY);
  const [updateProperty] = useMutation(UPDATE_PROPERTY);
  const [createProperty] = useMutation(CREATE_PROPERTY);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
    const handleSearch = async () => {
      if (!searchState.searchTerm) return;

      try {
        let response;
        switch (searchState.searchType) {
          case 'propertyId':
            response = await searchProperties({
              variables: {
                filter: {
                  id: { eq: searchState.searchTerm }
                },
                limit: 12
              }
            });
            break;

          case 'address':
            response = await searchProperties({
              variables: {
                filter: {
                  address: { contains: searchState.searchTerm }
                },
                limit: 12
              }
            });
            break;

          case 'ownerId':
            response = await searchProperties({
              variables: {
                filter: {
                  profOwnerId: { eq: searchState.searchTerm }
                },
                limit: 12
              }
            });
            break;
        }

        setSearchState({
          ...searchState,
          searchResults: response.data?.listProperties?.items || []
        });
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
      // Clear tenant relationship if exists
      if (propertyToDelete.profTenantId) {
        await updateProfile({
          variables: {
            input: {
              id: propertyToDelete.profTenantId,
              tenantAtId: null
            }
          }
        });
      }

      // Delete the property
      await deleteProperty({
        variables: { 
          input: { id: propertyToDelete.id }
        }
      });

      setShowDeleteModal(false);
      setPropertyToDelete(null);
      handleSearch();
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const handleSave = async (formData) => {
    try {
      const mutationInput = {
        id: formData.id,
        address: formData.address,
        profOwnerId: formData.profOwnerId,
        owner: formData.profOwnerId,
        profTenantId: formData.profTenantId,
        type: formData.type
      };

      await updateProperty({
        variables: {
          input: mutationInput
        }
      });

      // Then update the tenant's profile if there is one
      if (formData.profTenantId) {
        await updateProfile({
          variables: {
            input: {
              id: formData.profTenantId,
              tenantAtId: formData.id
            }
          }
        });
      }

      setShowEditModal(false);
      handleSearch(); // Refresh results
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

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
          <option value="address">Address</option>
          <option value="ownerId">Owner ID</option>
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
                <div>Owner: {property.profOwnerId}</div>
                <div>Tenant: {property.profTenantId}</div>
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
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          initialValues={selectedProperty}
          onSubmit={handleSave}
        />
      )}

      <DeleteConfirmationModal
        show={showDeleteModal}
        objectId={propertyToDelete?.id}
        onConfirm={confirmDelete}
        onClose={() => {
          setShowDeleteModal(false);
          setPropertyToDelete(null);
        }}
      />
    </div>
  );
};
export default PropertyManager;