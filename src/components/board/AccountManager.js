import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_ACCOUNTS, SEARCH_ACCOUNTS_BY_OWNER } from '../../queries/queries';
import AccountEditModal from './AccountEditModal';
import BoardCard from './shared/BoardCard';
import './AccountManager.css';
import './shared/BoardTools.css';

const AccountManager = ({ searchState, setSearchState }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
    const handleView = (account) => {
      // View account details logic
    };

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

    const handleDelete = (account) => {
      console.log('Deleting account:', account.id);
    };

    return (
      <div className="board-tool">
        <h1 className="section-title">Account Search</h1>
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
            className="search-input"
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
          <button onClick={() => {
            setSelectedAccount(null)
            setShowEditModal(true)
          }}>Create New</button>
        </div>
          <div className="results-grid">
            {searchState.searchResults.map(account => (
              <BoardCard
                key={account.id}
                header={<h3>Account #{account.id}</h3>}
                content={
                  <>
                    <div>Owner: {account.accountOwnerID}</div>
                    <div>Balance: ${account.balance}</div>
                    <div>Billing Frequency: {account.billingFrequency}</div>
                  </>
                }
                status={account.status}
                actions={
                  <>
                    <button onClick={() => handleEdit(account)}>Edit</button>
                    <button onClick={() => handleDelete(account)}>Delete</button>
                  </>
                }
              />
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
