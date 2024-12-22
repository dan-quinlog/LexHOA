import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_ACCOUNTS, SEARCH_ACCOUNTS_BY_OWNER } from '../../queries/queries';
import AccountCard from './AccountCard';
import AccountEditModal from './AccountEditModal';
import './AccountManager.css';

const AccountManager = ({ searchState, setSearchState }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [searchAccounts] = useLazyQuery(SEARCH_ACCOUNTS);
  const [searchByOwner] = useLazyQuery(SEARCH_ACCOUNTS_BY_OWNER);

  const handleSearch = async () => {
    if (!searchState.searchTerm) return;

    try {
      let response;
      switch (searchState.searchType) {
        case 'accountId':
          response = await searchAccounts({
            variables: { filter: { id: { contains: searchState.searchTerm } } }
          });
          setSearchState({
            ...searchState,
            searchResults: response.data?.listAccounts?.items || []
          });
          break;
        case 'ownerId':
          response = await searchByOwner({
            variables: { accountOwnerId: searchState.searchTerm }
          });
          setSearchState({
            ...searchState,
            searchResults: response.data?.accountByOwner?.items || []
          });
          break;
      }
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
      <h2>Account Search</h2>
      <div className="search-controls">
        <select
          value={searchState.searchType}
          onChange={(e) => setSearchState({
            ...searchState,
            searchType: e.target.value
          })}
        >
          <option value="accountId">Account ID</option>
          <option value="ownerId">Owner ID</option>
        </select>
        <input
          type="text"
          value={searchState.searchTerm}
          onChange={(e) => setSearchState({
            ...searchState,
            searchTerm: e.target.value
          })}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSearch()
          }}
          placeholder="Search accounts..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="accounts-grid">
        {searchState.searchResults.map((account) => (
          <div key={account.id} className="account-card">
            <h3>{account.accountName}</h3>
            <p><strong>Account ID: {account.id}</strong></p>
            <p>Owner ID: {account.accountOwnerId}</p>
            <p>Balance: ${account.balance}</p>
            <p>Billing Frequency: {account.billingFreq}</p>
            <button onClick={() => handleEdit(account)}>Edit</button>
          </div>
        ))}
      </div>

      {showEditModal && (
        <AccountEditModal
          account={selectedAccount}
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            handleSearch();
          }}
        />
      )}
    </div>
  );
};
export default AccountManager;