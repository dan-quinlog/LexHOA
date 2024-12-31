import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  SEARCH_PEOPLE_BY_EMAIL,
  SEARCH_PEOPLE_BY_NAME,
  SEARCH_PEOPLE_BY_PHONE,
  SEARCH_PEOPLE_BY_ID,
  SEARCH_PEOPLE_BY_COGNITO
} from '../../queries/queries';
import ProfileEditForm from './ProfileEditForm';
import Modal from '../shared/Modal';
import BoardCard from './shared/BoardCard';
import './PersonManager.css';
import './shared/BoardTools.css';

import MergeProfilesModal from './MergeProfilesModal';
const PersonManager = ({ searchState, setSearchState }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);

  const [searchByEmail] = useLazyQuery(SEARCH_PEOPLE_BY_EMAIL);
  const [searchByName] = useLazyQuery(SEARCH_PEOPLE_BY_NAME);
  const [searchByPhone] = useLazyQuery(SEARCH_PEOPLE_BY_PHONE);
  const [searchById] = useLazyQuery(SEARCH_PEOPLE_BY_ID);
  const [searchByCognito] = useLazyQuery(SEARCH_PEOPLE_BY_COGNITO);

  const handleDelete = (person) => {
    // Delete person logic will be implemented here
    console.log('Deleting person:', person.id);
  };
  
  const handleSearch = async () => {
    setErrors({});
    if (!searchState.searchValue) {
      setErrors({ search: 'Search value is required' });
      return;
    }


    try {
      let response;
      switch (searchState.searchType) {
        case 'email':
          response = await searchByEmail({ variables: { email: searchState.searchValue } });
          setSearchState({
            ...searchState,
            searchResults: response.data?.personByEmail?.items || []
          });
          break;
        case 'name':
          response = await searchByName({ variables: { name: searchState.searchValue } });
          setSearchState({
            ...searchState,
            searchResults: response.data?.personByName?.items || []
          });
          break;
        case 'phone':
          response = await searchByPhone({ variables: { phone: searchState.searchValue } });
          setSearchState({
            ...searchState,
            searchResults: response.data?.personByPhone?.items || []
          });
          break;
        case 'userId':
          response = await searchById({ variables: { id: searchState.searchValue } });
          setSearchState({
            ...searchState,
            searchResults: response.data?.getPerson ? [response.data.getPerson] : []
          });
          break;
        case 'cognitoId':
          response = await searchByCognito({ variables: { cognitoID: searchState.searchValue } });
          setSearchState({
            ...searchState,
            searchResults: response.data?.personByCognitoID?.items || []
          });
          break;
      }
    } catch (error) {
      console.error('Search error:', error);
      setErrors({ search: 'Error performing search' });
    }
  };

  const handleEdit = (profile) => {
    setSelectedProfile(profile);
    setShowModal(true);
  };

  const handleProfileSelect = (profile) => {
    if (selectedProfiles.find(p => p.id === profile.id)) {
      setSelectedProfiles(selectedProfiles.filter(p => p.id !== profile.id));
    } else {
      setSelectedProfiles([...selectedProfiles, profile]);
    }
  };

  const SelectedProfilesSection = () => {
    if (selectedProfiles.length === 0) return null;

    return (
      <div className="selected-profiles-section">
        <h3>Selected Profiles for Merge</h3>
        <div className="selected-profiles-list">
          {selectedProfiles.map(profile => (
            <div key={profile.id} className="selected-profile-item">
              <button
                className="remove-profile"
                onClick={() => handleProfileSelect(profile)}
              >
                X
              </button>
              <span>{profile.name} (ID: {profile.id})</span>
            </div>
          ))}
        </div>
        {selectedProfiles.length === 2 && (
          <button
            className="apply-merge-button"
            onClick={() => setShowMergeModal(true)}
          >
            Apply Merge
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="board-tool">
      <div className="search-section">
        <h1 className="section-title">Person Search</h1>
        <div className="search-controls">
          <select
            value={searchState.searchType}
            onChange={(e) => setSearchState({
              ...searchState,
              searchType: e.target.value
            })}
          >
            <option value="email">Email</option>
            <option value="name">Name</option>
            <option value="phone">Phone</option>
            <option value="userId">User ID</option>
            <option value="cognitoId">Cognito ID</option>
          </select>
          <input
            type="text"
            className="search-input"
            value={searchState.searchValue}
            onChange={(e) => setSearchState({
              ...searchState,
              searchValue: e.target.value
            })}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder={`Search by ${searchState.searchType}...`}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        {errors.search && <div className="error-message">{errors.search}</div>}
      </div>
      <SelectedProfilesSection />
      <div className="results-grid">
        {searchState.searchResults.map(person => (
          <BoardCard
            key={person.id}
            header={<h3>{person.name}</h3>}
            content={
              <>
                <div>Cognito ID: {person.cognitoID}</div>
                <div>Email: {person.email}</div>
                <div>Phone: {person.phone}</div>
                <div>Role: {person.role}</div>
              </>
            }
            status={person.status}
            actions={
              <>
                <button onClick={() => handleEdit(person)}>Edit</button>
                <button onClick={() => handleDelete(person)}>Delete</button>
                <button onClick={() => handleProfileSelect(person)}>
                  {selectedProfiles.find(p => p.id === person.id)
                    ? 'Unselect'
                    : 'Select for Merge'}
                </button>
              </>
            }
          />
        ))}
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <ProfileEditForm
            profile={selectedProfile}
            onCancel={() => setShowModal(false)}
            onSave={() => {
              setShowModal(false);
              handleSearch();
            }}
          />
        </Modal>
      )}
      {console.log('Current showMergeModal state:', showMergeModal)}
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
    </div>
  );
};

export default PersonManager;