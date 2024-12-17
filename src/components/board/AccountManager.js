import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { SEARCH_ACCOUNTS } from '../../queries/queries';
import AccountCard from './AccountCard';
import AccountEditModal from './AccountEditModal';
import './AccountManager.css';

const AccountManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('accountId');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filter, setFilter] = useState(null);

  const { loading, error, data, refetch } = useQuery(SEARCH_ACCOUNTS, {
    variables: { filter },
    fetchPolicy: 'network-only'
  });

  const handleSearch = () => {
    if (!searchTerm) {
      setFilter(null);
      return;
    }

    let newFilter = {
      or: []
    };

    switch(searchType) {
      case 'accountId':
        newFilter.or.push({ id: { contains: searchTerm } });
        break;
      case 'ownerId':
        newFilter.or.push({ accountOwnerId: { eq: searchTerm } });
        break;
      case 'propertyId':
        newFilter.or.push({ 
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

    setFilter(newFilter);
    refetch({ filter: newFilter });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>
      
      <div className="accounts-grid">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error loading accounts</div>
        ) : (
          data?.listAccounts.items.map((account) => (
            <AccountCard 
              key={account.id}
              account={account} 
              onEdit={() => handleEdit(account)}
            />
          ))
        )}
      </div>

      {showEditModal && (
        <AccountEditModal
          account={selectedAccount}
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default AccountManager;