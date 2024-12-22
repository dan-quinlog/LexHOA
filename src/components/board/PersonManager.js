import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  SEARCH_PEOPLE_BY_EMAIL,
  SEARCH_PEOPLE_BY_NAME,
  SEARCH_PEOPLE_BY_PHONE,
  SEARCH_PEOPLE_BY_ID,
  SEARCH_PEOPLE_BY_COGNITO
} from '../../queries/queries';
import ProfileEditForm from '../forms/ProfileEditForm';
import Modal from '../shared/Modal';
import './PersonManager.css';
import MergeProfilesModal from './MergeProfilesModal';
const PersonManager = ({ searchState, setSearchState }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [errors, setErrors] = useState({});
  // Add new state for selected profiles
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);

  const [searchByEmail] = useLazyQuery(SEARCH_PEOPLE_BY_EMAIL);
  const [searchByName] = useLazyQuery(SEARCH_PEOPLE_BY_NAME);
  const [searchByPhone] = useLazyQuery(SEARCH_PEOPLE_BY_PHONE);
  const [searchById] = useLazyQuery(SEARCH_PEOPLE_BY_ID);
  const [searchByCognito] = useLazyQuery(SEARCH_PEOPLE_BY_COGNITO);

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

  // Add handler for profile selection
  const handleProfileSelect = (profile) => {
    if (selectedProfiles.find(p => p.id === profile.id)) {
      setSelectedProfiles(selectedProfiles.filter(p => p.id !== profile.id));
    } else {
      setSelectedProfiles([...selectedProfiles, profile]);
    }
  };

  return (
    <div className="person-manager">
      <div className="search-section">
        <h2>Person Search</h2>
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
          <button
            className="merge-button"
            disabled={selectedProfiles.length !== 2}
            onClick={() => setShowMergeModal(true)}
          >
            Merge Selected Profiles
          </button>
        </div>
        {errors.search && <div className="error-message">{errors.search}</div>}
      </div>
      
      <div className="search-results">
        {searchState.searchResults.map((profile) => (
          <div key={profile.id} className="profile-card">
            <div className="profile-header">
              <input
                type="checkbox"
                checked={selectedProfiles.some(p => p.id === profile.id)}
                onChange={() => handleProfileSelect(profile)}
              />
              <h3>{profile.name}</h3>
            </div>
            <p>ID: {profile.id}</p>
            <p>Cognito ID: {profile.cognitoID}</p>
            <p>{profile.email}</p>
            <p>{profile.address}</p>
            <p>{profile.phone}</p>
            <button onClick={() => handleEdit(profile)}>Edit</button>
          </div>
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
};export default PersonManager;
