import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { 
  SEARCH_PEOPLE_BY_EMAIL, 
  SEARCH_PEOPLE_BY_NAME, 
  SEARCH_PEOPLE_BY_PHONE 
} from '../../queries/queries';
import ProfileEditForm from '../forms/ProfileEditForm';
import Modal from '../shared/Modal';
import './PersonManager.css';

const PersonManager = () => {
  const [searchType, setSearchType] = useState('email');
  const [searchValue, setSearchValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [errors, setErrors] = useState({});

  const [searchByEmail] = useLazyQuery(SEARCH_PEOPLE_BY_EMAIL);
  const [searchByName] = useLazyQuery(SEARCH_PEOPLE_BY_NAME);
  const [searchByPhone] = useLazyQuery(SEARCH_PEOPLE_BY_PHONE);

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleSearch = async () => {
    setErrors({});
    
    if (!searchValue) {
      setErrors({ search: 'Search value is required' });
      return;
    }

    if (searchType === 'phone') {
      if (!validatePhone(searchValue)) {
        setErrors({ search: 'Invalid phone format. Use 9999999999 or 999-999-9999' });
        return;
      }
    }

    try {
      let response;
      switch (searchType) {
        case 'email':
          response = await searchByEmail({ variables: { email: searchValue } });
          setSearchResults(response.data?.personByEmail?.items || []);
          break;
        case 'name':
          response = await searchByName({ variables: { name: searchValue } });
          setSearchResults(response.data?.personByName?.items || []);
          break;
        case 'phone':
          const formattedPhone = formatPhone(searchValue.replace(/-/g, ''));
          response = await searchByPhone({ variables: { phone: formattedPhone } });
          setSearchResults(response.data?.personByPhone?.items || []);
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

  return (
    <div className="person-manager">
      <div className="search-section">
        <h2>Person Search</h2>
        <div className="search-controls">
          <select 
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="email">Email</option>
            <option value="name">Name</option>
            <option value="phone">Phone</option>
          </select>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            placeholder={`Search by ${searchType}...`}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        {errors.search && <div className="error-message">{errors.search}</div>}
      </div>

      <div className="search-results">
        {searchResults.map((profile) => (
          <div key={profile.id} className="profile-card">
            <h3>{profile.name}</h3>
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
              handleSearch(); // Refresh results
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default PersonManager;