import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_PAYMENTS, SEARCH_PAYMENTS_BY_OWNER } from '../../queries/queries';
import PaymentCard from './PaymentCard';
import PaymentEditModal from './PaymentEditModal';
import BoardCard from './shared/BoardCard';
import './PaymentManager.css';
import './shared/BoardTools.css';

const handleDelete = (payment) => {
  console.log('Deleting payment:', payment.id);
};

const PaymentManager = ({ searchState, setSearchState }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [searchPayments] = useLazyQuery(SEARCH_PAYMENTS);
  const [searchByOwner] = useLazyQuery(SEARCH_PAYMENTS_BY_OWNER);

  const handleSearch = async () => {
    if (!searchState.searchTerm) return;

    try {
      let response;
      switch (searchState.searchType) {
        case 'paymentId':
          response = await searchPayments({
            variables: {
              filter: {
                id: { eq: searchState.searchTerm }
              }
            }
          });
          setSearchState({
            ...searchState,
            searchResults: response.data?.listPayments?.items || []
          });
          break;
        case 'ownerId':
          response = await searchByOwner({
            variables: { ownerPaymentsId: searchState.searchTerm }
          });
          setSearchState({
            ...searchState,
            searchResults: response.data?.paymentsByOwner?.items || []
          });
          break;
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setShowEditModal(true);
  };

  const handleProcess = (payment) => {
    // Payment processing logic
  };

  const handleView = (payment) => {
    // View details logic
  };

  return (
    <div className="board-tool">
      <h1 className="section-title">Payment Search</h1>
      <div className="search-controls">
        <select
          value={searchState.searchType}
          onChange={(e) => setSearchState({
            ...searchState,
            searchType: e.target.value
          })}
        >
          <option value="paymentId">Payment ID</option>
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
          placeholder="Search payments..."
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={() => {
          setSelectedPayment(null)
          setShowEditModal(true)
        }}>Create New</button>
      </div>
      <div className="results-grid">
        {searchState.searchResults.map(payment => (
          <BoardCard
            key={payment.id}
            header={<h3>Payment #{payment.id}</h3>}
            content={
              <>
                <div>Entered On: {payment.createdAt}</div>
                <div>Check Date: {payment.checkDate}</div>
                <div>Check Amount: ${payment.amount}</div>
                <div>Owner ID: {payment.ownerID}</div>
              </>
            }
            actions={
              <>
                <button onClick={() => handleEdit(payment)}>Edit</button>
                <button onClick={() => handleDelete(payment)}>Delete</button>
              </>
            }
          />
        ))}
      </div>
      {showEditModal && (
        <PaymentEditModal
          payment={selectedPayment}
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

export default PaymentManager;

