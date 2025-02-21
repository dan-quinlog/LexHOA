import React, { useState } from 'react';
import { useLazyQuery, useMutation, useApolloClient } from '@apollo/client';
import { SEARCH_PROFILES, GET_PROFILE, PROFILE_BY_COGNITO_ID, FIND_RELATED_PROPERTIES } from '../../queries/queries';
import { CREATE_PROFILE, UPDATE_PROFILE, DELETE_PROFILE, UPDATE_PROPERTY } from '../../queries/mutations';
import BoardCard from './shared/BoardCard';
import ProfileEditModal from '../shared/ProfileEditModal';
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal';
import MergeProfilesModal from '../modals/MergeProfilesModal';
import NotificationModal from '../modals/NotificationModal';
import './shared/BoardTools.css';

const PersonManager = ({ searchState, setSearchState }) => {
  const client = useApolloClient();
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const [searchProfiles] = useLazyQuery(SEARCH_PROFILES);
  const [searchById] = useLazyQuery(GET_PROFILE);
  const [searchByCognito] = useLazyQuery(PROFILE_BY_COGNITO_ID);
  const [updateProperty] = useMutation(UPDATE_PROPERTY);

  // Add mutations
  const [createPerson] = useMutation(CREATE_PROFILE);
  const [updatePerson] = useMutation(UPDATE_PROFILE);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [deletePerson] = useMutation(DELETE_PROFILE);

  const handleDelete = (person) => {
    setPersonToDelete(person);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // First find all related properties
      const relatedProperties = await client.query({
        query: FIND_RELATED_PROPERTIES,
        variables: { profileId: personToDelete.id }
      });

      // Update each property to remove references
      const updatePromises = relatedProperties.data.listProperties.items.map(property => {
        const updates = {
          id: property.id,
          _version: property._version
        };
        if (property.profOwnerId === personToDelete.id) {
          updates.profOwnerId = null;
          updates.owner = null;
        }
        if (property.profTenantId === personToDelete.id) {
          updates.profTenantId = null;
        }
        return updateProperty({
          variables: {
            input: {
              id: property.id,
              ...updates
            }
          }
        });
      });

      await Promise.all(updatePromises);

      // Now safe to delete the profile
      await deletePerson({
        variables: { input: { id: personToDelete.id } }
      });

      setShowDeleteModal(false);
      setPersonToDelete(null);
      handleSearch();
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const handleMergeProfiles = async (cognitoProfile, manualProfile, mergedData) => {
    try {
      // Find related properties
      const relatedProperties = await client.query({
        query: FIND_RELATED_PROPERTIES,
        variables: { profileId: manualProfile.id }
      });

      // Update properties to point to cognito profile
      const updatePromises = relatedProperties.data.listProperties.items.map(property => {
        const updates = { id: property.id };
        if (property.profOwnerId === manualProfile.id) {
          updates.profOwnerId = cognitoProfile.id;
          updates.owner = cognitoProfile.id;
        }
        if (property.profTenantId === manualProfile.id) {
          updates.profTenantId = cognitoProfile.id;
        }
        return updateProperty({ variables: { input: updates } });
      });

      await Promise.all(updatePromises);

      // Update cognito profile with merged data
      await updatePerson({
        variables: {
          input: {
            id: cognitoProfile.id,
            ...mergedData
          }
        }
      });

      // Delete manual profile
      await deletePerson({
        variables: { input: { id: manualProfile.id } }
      });

      setShowMergeModal(false);
      setSelectedProfiles([]);
      handleSearch();
    } catch (error) {
      console.error('Error merging profiles:', error);
    }
  };

  const cleanFormData = (formData) => {
    const fieldsToRemove = [
      '__typename',
      'createdAt',
      'updatedAt',
      'ownedProperties',
      'cognitoID',
      'tenantAtId'
    ];

    return Object.entries(formData).reduce((acc, [key, value]) => {
      if (!fieldsToRemove.includes(key)) {
        acc[key] = value === '' ? null : value;
      }
      return acc;
    }, {});
  };

  const handleSave = async (formData) => {
    try {
      const cleanedData = cleanFormData(formData);
      if (selectedPerson?.id) {
        await updatePerson({
          variables: {
            input: {
              id: selectedPerson.id,
              ...cleanedData
            }
          }
        });
      } else {
        await createPerson({
          variables: {
            input: cleanedData
          }
        });
      }
      setShowEditModal(false);
      handleSearch(); // Refresh the results
    } catch (error) {
      console.error('Error saving person:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchState.searchTerm) {
      setErrors({ search: 'Search value is required' });
      return;
    }

    try {
      let response;
      switch (searchState.searchType) {
        case 'id':
          response = await searchById({
            variables: { id: searchState.searchTerm }
          });
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data?.getProfile ? [response.data.getProfile] : []
          }));
          break;

        case 'cognitoID':
          response = await searchByCognito({
            variables: { cognitoID: searchState.searchTerm }
          });
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data?.profileByCognitoID?.items || []
          }));
          break;
        case 'email':
        case 'name':
        case 'phone':
          response = await searchProfiles({
            variables: {
              filter: {
                [searchState.searchType]: { contains: searchState.searchTerm }
              },
              limit: 10
            }
          });
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data?.listProfiles?.items || []
          }));
          break;
      }
    } catch (error) {
      console.error('Search error:', error);
      setErrors({ search: 'Error performing search' });
    }
  };

  const handleProfileSelect = (profile) => {
    if (selectedProfiles.find(p => p.id === profile.id)) {
      setSelectedProfiles(selectedProfiles.filter(p => p.id !== profile.id));
    } else {
      const newSelectedProfiles = [...selectedProfiles, profile];

      if (newSelectedProfiles.length === 2) {
        const cognitoProfiles = newSelectedProfiles.filter(p => p.cognitoID);
        if (cognitoProfiles.length === 2) {
          setNotificationMessage("Select a profile without a Cognito ID to merge");
          setShowNotification(true);
          return;
        }
        setShowMergeModal(true);
      }
      setSelectedProfiles(newSelectedProfiles);
    }
  };

  const getPersonRoleTags = (person) => {
    const isOwner = person?.ownedProperties?.items?.length > 0;
    const isResident = person?.tenantAtId;

    if (isOwner && isResident) {
      return <span className="role-tag">Owner Resident</span>;
    }

    return (
      <>
        {isOwner && <span className="role-tag">Owner</span>}
        {isResident && <span className="role-tag">Resident</span>}
      </>
    );
  };

  return (
    <>
      <div className="board-tool">
        <h2 className="section-title">Person Management</h2>
        <div className="search-controls">
          <select
            value={searchState.searchType}
            onChange={(e) => setSearchState({
              ...searchState,
              searchType: e.target.value
            })}
            className="search-type"
          >
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="cognitoID">Cognito ID</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
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
            setSelectedPerson(null);
            setShowEditModal(true);
          }}>Create New</button>
        </div>

        {errors.search && <div className="error-message">{errors.search}</div>}

        {/* Selected Profiles Section */}
        {selectedProfiles.length > 0 && (
          <div className="selected-profiles">
            {/* Existing selected profiles UI */}
          </div>
        )}

        <div className="results-grid">
          {searchState.searchResults.map(person => (
            <BoardCard
              key={person.id}
              header={
                <div className="person-header">
                  <h3>{person.name}</h3>
                  {getPersonRoleTags(person)}
                </div>
              }
              content={
                <>
                  <div>Profile ID: {person.id}</div>
                  <div>Cognito ID: {person.cognitoID}</div>
                  <div>Email: {person.email}</div>
                  <div>Phone: {person.phone}</div>
                </>
              }
              status={person.status}
              actions={
                <>
                  <button onClick={() => {
                    setSelectedPerson(person)
                    setShowEditModal(true)
                  }}>Edit</button>
                  <button onClick={() => handleDelete(person)}>Delete</button>
                  <button onClick={() => handleProfileSelect(person)}>
                    {selectedProfiles.find(p => p.id === person.id) ? 'Unselect' : 'Select for Merge'}
                  </button>
                </>
              }
            />
          ))}
        </div>
        {showEditModal && (
          <ProfileEditModal
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            initialValues={selectedPerson}
            isOwner={selectedPerson?.ownedProperties?.items?.length > 0}
            isBoard={true}
            onSubmit={handleSave}
          />
        )}
        {showMergeModal && (
          <MergeProfilesModal
            profiles={selectedProfiles}
            show={showMergeModal}
            onClose={() => {
              setShowMergeModal(false);
              setSelectedProfiles([]);
            }}
            onMerge={handleMergeProfiles}
          />
        )}
        {showDeleteModal && (
          <DeleteConfirmationModal
            show={showDeleteModal}
            objectId={personToDelete?.id}
            onConfirm={confirmDelete}
            onClose={() => {
              setShowDeleteModal(false)
              setPersonToDelete(null)
            }}
          />
        )}
      </div >

      {showNotification && (
        <NotificationModal
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />
      )
      }
    </>
  );
};

export default PersonManager;
