import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  PROFILE_BY_EMAIL,
  PROFILE_BY_NAME,
  PROFILE_BY_PHONE,
  GET_PROFILE,
  PROFILE_BY_COGNITO_ID
} from '../../queries/queries';
import { CREATE_PROFILE, UPDATE_PROFILE, DELETE_PROFILE } from '../../queries/mutations';
import BoardCard from './shared/BoardCard';
import ProfileEditModal from '../shared/ProfileEditModal';
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal';
import './PersonManager.css';
import './shared/BoardTools.css';

import MergeProfilesModal from './MergeProfilesModal';
const PersonManager = ({ searchState, setSearchState }) => {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [showMergeModal, setShowMergeModal] = useState(false);

  // Initialize all query hooks
  const [searchByEmail] = useLazyQuery(PROFILE_BY_EMAIL);
  const [searchByName] = useLazyQuery(PROFILE_BY_NAME);
  const [searchByPhone] = useLazyQuery(PROFILE_BY_PHONE);
  const [searchById] = useLazyQuery(GET_PROFILE);
  const [searchByCognito] = useLazyQuery(PROFILE_BY_COGNITO_ID);

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
      await deletePerson({
        variables: { input: { id: personToDelete.id } }
      });
      setShowDeleteModal(false);
      setPersonToDelete(null);
      handleSearch(); // Refresh the list
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        await updatePerson({
          variables: { input: formData }
        });
      } else {
        await createPerson({
          variables: { input: formData }
        });
      }
      setShowEditModal(false);
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
          response = await searchById({ variables: { id: searchState.searchTerm } });
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data?.getPerson ? [response.data.getPerson] : []
          }));
          break;
        case 'email':
          response = await searchByEmail({ variables: { email: searchState.searchTerm } });
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data?.personByEmail?.items || []
          }));
          break;
        case 'name':
          response = await searchByName({ variables: { name: searchState.searchTerm } });
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data?.personByName?.items || []
          }));
          break;
        case 'phone':
          response = await searchByPhone({ variables: { phone: searchState.searchTerm } });
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data?.personByPhone?.items || []
          }));
          break;
        case 'cognitoID':
          response = await searchByCognito({ variables: { cognitoID: searchState.searchTerm } });
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data?.personByCognitoID?.items || []
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
      setSelectedProfiles([...selectedProfiles, profile]);
    }
  };

  return (
    <div className="board-tool">
      <h2 className="section-title">Person Management</h2>
      <div className="search-controls">
        <select
          value={searchState.searchType}
          onChange={(e) => setSearchState({ ...searchState, searchType: e.target.value })}
        >
          <option value="id">ID</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="cognitoID">Cognito ID</option>
        </select>
        <input
          className="search-input"
          value={searchState.searchTerm}
          onChange={(e) => setSearchState({ ...searchState, searchTerm: e.target.value })}
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
            header={<h3>{person.name}</h3>}
            content={
              <>
                <div>Account ID: {person.id}</div>
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
          person={selectedPerson}
          isBoard={true}
        />
      )}
      {showMergeModal && (
        <MergeProfilesModal
          profiles={selectedProfiles}
          show={showMergeModal}
          onClose={() => {
            console.log('Modal close triggered');
            setShowMergeModal(false);
            setSelectedProfiles([]);
            handleSearch();
          }}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal
          id={personToDelete?.id}
          onConfirm={confirmDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};
export default PersonManager;


