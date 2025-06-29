import React, { useState } from 'react';
import { useLazyQuery, useMutation, useApolloClient } from '@apollo/client';
import { SEARCH_PROFILES, GET_PROFILE, PROFILE_BY_COGNITO_ID, FIND_RELATED_PROPERTIES } from '../../queries/queries';
import { CREATE_PROFILE, UPDATE_PROFILE, DELETE_PROFILE, UPDATE_PROPERTY } from '../../queries/mutations';
import BoardCard from './shared/BoardCard';
import ProfileEditModal from '../shared/ProfileEditModal';
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal';
import MergeProfilesModal from '../modals/MergeProfilesModal';
import NotificationModal from '../modals/NotificationModal';
import { copyWithFeedback } from '../../utils/clipboardUtils';
import './shared/BoardTools.css';

// Get group names from environment variables
const PRESIDENT_GROUP = process.env.REACT_APP_PRESIDENT_GROUP_NAME;
const SECRETARY_GROUP = process.env.REACT_APP_SECRETARY_GROUP_NAME;
const TREASURER_GROUP = process.env.REACT_APP_TREASURER_GROUP_NAME;
const BOARD_GROUP = process.env.REACT_APP_BOARD_GROUP_NAME;

const PersonManager = ({ searchState, setSearchState, userGroups = [] }) => {
  const client = useApolloClient();
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Permission checks
  const isPresident = userGroups && userGroups.includes(PRESIDENT_GROUP);
  const isSecretary = userGroups && userGroups.includes(SECRETARY_GROUP);
  const isTreasurer = userGroups && userGroups.includes(TREASURER_GROUP);
  const isBoard = userGroups && userGroups.includes(BOARD_GROUP);
  
  // Only President and Secretary can delete profiles
  const hasDeletePermission = isPresident || isSecretary;
  
  // Only President and Treasurer can edit balance
  const hasBalanceEditPermission = isPresident || isTreasurer;
  
  // All board members can edit basic profile info
  const hasEditPermission = isBoard;
  
  // Only President can create new profiles (or Secretary for special cases)
  const hasCreatePermission = isPresident || isSecretary;

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
    // Only President can delete profiles directly
    if (!isPresident) {
      setNotificationMessage("Only the President can delete profiles directly");
      setShowNotification(true);
      return;
    }
    
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
              }
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
    // Allow profile selection for merge if user has delete permission
    if (!hasDeletePermission) {
      setNotificationMessage("You don't have permission to merge profiles");
      setShowNotification(true);
      return;
    }
    
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
            <option value="id">Profile ID</option>
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
          {/* Only show Create New button to users with create permission */}
          {hasCreatePermission && (
            <button onClick={() => {
              setSelectedPerson(null);
              setShowEditModal(true);
            }}>Create New</button>
          )}
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
                  <div>
                    Profile ID: {person.id}
                    <button 
                      className="copy-btn" 
                      onClick={() => copyWithFeedback(person.id)}
                      title="Copy Profile ID"
                    >
                      📋
                    </button>
                  </div>
                  <div>
                    Cognito ID: {person.cognitoID || 'None'}
                    {person.cognitoID && (
                      <button 
                        className="copy-btn" 
                        onClick={() => copyWithFeedback(person.cognitoID)}
                        title="Copy Cognito ID"
                      >
                        📋
                      </button>
                    )}
                  </div>
                  <div>Email: {person.email}</div>
                  <div>Phone: {person.phone}</div>
                </>
              }
              status={person.status}
              actions={
                <>
                  {/* All BOARD members can edit profiles */}
                  {hasEditPermission && (
                    <button onClick={() => {
                      setSelectedPerson(person)
                      setShowEditModal(true)
                    }}>Edit</button>
                  )}
                  
                  {/* Only PRESIDENT can delete profiles directly */}
                  {isPresident && (
                    <button onClick={() => handleDelete(person)}>Delete</button>
                  )}
                  
                  {/* PRESIDENT and SECRETARY can merge profiles */}
                  {(isPresident || isSecretary) && (
                    <button onClick={() => handleProfileSelect(person)}>
                      {selectedProfiles.find(p => p.id === person.id) ? 'Unselect' : 'Select for Merge'}
                    </button>
                  )}
                </>
              }
            />
          ))}
        </div>

        {showEditModal && hasEditPermission && (
          <ProfileEditModal
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            initialValues={selectedPerson}
            isOwner={selectedPerson?.ownedProperties?.items?.length > 0}
            isBoard={true}
            hasBalanceEditPermission={hasBalanceEditPermission}
            userGroups={userGroups}
            onSubmit={handleSave}
          />
        )}

        {showMergeModal && (isPresident || isSecretary) && (
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

        {showDeleteModal && isPresident && (
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
      </div>

      {showNotification && (
        <NotificationModal
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
};

export default PersonManager;
