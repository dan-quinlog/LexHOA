import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_ACCOUNTS, SEARCH_ACCOUNTS_BY_OWNER } from '../../queries/queries';
import AccountCard from './AccountCard';
import AccountEditModal from './AccountEditModal';
import './AccountManager.css';

const AccountManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('accountId');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [searchAccounts] = useLazyQuery(SEARCH_ACCOUNTS);
  const [searchByOwner] = useLazyQuery(SEARCH_ACCOUNTS_BY_OWNER);

  const handleSearch = async () => {
    if (!searchTerm) return;

    let filter = {
      or: []
    };

    switch(searchType) {
      case 'accountId':
        filter.or.push({ id: { contains: searchTerm } });
        break;
      case 'ownerId':
        const ownerResponse = await searchByOwner({ 
          variables: { accountOwnerId: searchTerm }
        });
        setSearchResults(ownerResponse.data?.accountByOwner?.items || []);
        return;
      case 'propertyId':
        filter.or.push({
          properties: {
            some: {
              id: { eq: searchTerm }
            }
          }
        });
        break;
      default:
        break;
    }

    try {
      const response = await searchAccounts({ variables: { filter } });
      setSearchResults(response.data?.listAccounts?.items || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setShowEditModal(true);
  };

  return (
    <div className="account-manager">
      <h2 className="section-title">Account Search</h2>
      <div className="search-controls">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="search-type"
        >
          <option value="accountId">Account ID</option>
          <option value="ownerId">Owner ID</option>
          <option value="propertyId">Property ID</option>
        </select>
        <input
          type="text"
          placeholder="Search Accounts"
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
      
      <div className="accounts-grid">
        {searchResults.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={() => handleEdit(account)}
          />
        ))}
      </div>

      {showEditModal && (
        <AccountEditModal
          account={selectedAccount}
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            handleSearch(); // Refresh results after edit
          }}
        />
      )}
    </div>
  );
};

export default AccountManager;