import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_PAYMENTS, SEARCH_PAYMENTS_BY_OWNER } from '../../queries/queries';
import PaymentCard from './PaymentCard';
import PaymentEditModal from './PaymentEditModal';

const PaymentManager = ({ searchState, setSearchState }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [searchPayments] = useLazyQuery(SEARCH_PAYMENTS);
  const [searchByOwner] = useLazyQuery(SEARCH_PAYMENTS_BY_OWNER);

  const handleSearch = async () => {
    if (!searchState.searchTerm) return;

    try {
      let response;
      switch(searchState.searchType) {
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

  return (
    <div className="payment-manager">
      <h2>Payment Search</h2>
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
      </div>

      <div className="payments-grid">
        {searchState.searchResults.map((payment) => (
          <PaymentCard
            key={payment.id}
            payment={payment}
            onEdit={() => handleEdit(payment)}
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