import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { LIST_PAYMENTS, PAYMENTS_BY_OWNER } from '../../queries/queries';
import { DELETE_PAYMENT } from '../../queries/mutations';
import PaymentEditModal from './PaymentEditModal';
import BoardCard from './shared/BoardCard';
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal';
import { copyWithFeedback } from '../../utils/clipboardUtils';
import './shared/BoardTools.css';

// Get group names from environment variables
const TREASURER_GROUP = process.env.REACT_APP_TREASURER_GROUP_NAME;
const PRESIDENT_GROUP = process.env.REACT_APP_PRESIDENT_GROUP_NAME;

const PaymentManager = ({ searchState, setSearchState, userGroups = [] }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  // Check if user has edit permissions (TREASURER or PRESIDENT)
  const hasEditPermission = userGroups && 
    (userGroups.includes(TREASURER_GROUP) || userGroups.includes(PRESIDENT_GROUP));

  const [searchPayments] = useLazyQuery(LIST_PAYMENTS);
  const [searchByOwner] = useLazyQuery(PAYMENTS_BY_OWNER);
  const [deletePayment] = useMutation(DELETE_PAYMENT);

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
          break;
        case 'ownerId':
          response = await searchByOwner({
            variables: {
              ownerPaymentsId: searchState.searchTerm,
              sortDirection: 'DESC'
            }
          });
          break;
        case 'invoiceNumber':
          response = await searchPayments({
            variables: {
              filter: {
                invoiceNumber: { eq: searchState.searchTerm }
              }
            }
          });
          break;
        case 'checkNumber':
          response = await searchPayments({
            variables: {
              filter: {
                checkNumber: { eq: searchState.searchTerm }
              }
            }
          });
          break;
      }

      setSearchState({
        ...searchState,
        searchResults: response.data?.listPayments?.items ||
          response.data?.paymentsByOwner?.items || []
      });
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setShowEditModal(true);
  };

  const handleDelete = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePayment({
        variables: { input: { id: paymentToDelete.id } }
      });
      setShowDeleteModal(false);
      setPaymentToDelete(null);
      handleSearch(); // Refresh the list
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const handleProcess = (payment) => {
    // Payment processing logic
  };

  const handleView = (payment) => {
    // View details logic
  };

  return (
    <div className="board-tool">
      <h2 className="section-title">Payment Search</h2>
      <div className="search-controls">
        <select
          value={searchState.searchType}
          onChange={(e) => setSearchState({
            ...searchState,
            searchType: e.target.value
          })}
          className="search-type"
        >
          <option value="paymentId">Payment ID</option>
          <option value="ownerId">Owner ID</option>
          <option value="invoiceNumber">Invoice Number</option>
          <option value="checkNumber">Check Number</option>
        </select>
        <input
          type="text"
          placeholder="Search..."
          value={searchState.searchTerm}
          onChange={(e) => setSearchState({
            ...searchState,
            searchTerm: e.target.value
          })}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="search-input"
        />
        <button onClick={handleSearch}>Search</button>
        {/* Only show Create New button to users with edit permission */}
        {hasEditPermission && (
          <button onClick={() => {
            setSelectedPayment(null)
            setShowEditModal(true)
          }}>Create New</button>
        )}
      </div>
      <div className="results-grid">
        {searchState.searchResults.map(payment => (
          <BoardCard
            key={payment.id}
            header={<h3>Payment {payment.id}</h3>}
            content={
              <>
                <div>
                  Owner: {payment.ownerPayments?.name || payment.ownerPaymentsId || 'Unknown'}
                  {payment.ownerPaymentsId && (
                    <button 
                      className="copy-btn" 
                      onClick={(e) => copyWithFeedback(payment.ownerPaymentsId, e)}
                      title="Copy Owner ID"
                    >
                      Copy
                    </button>
                  )}
                </div>
                <div>Check ID: {payment.checkNumber || 'N/A'}</div>
                <div>Check Amount: ${payment.checkAmount ? payment.checkAmount.toFixed(2) : '0.00'}</div>
                <div>Check Date: {payment.checkDate}</div>
              </>
            }
            actions={
              hasEditPermission ? (
                <>
                  <button onClick={() => handleEdit(payment)}>Edit</button>
                  <button onClick={() => handleDelete(payment)}>Delete</button>
                </>
              ) : null
            }
          />
        ))}
      </div>
      {
        showEditModal && hasEditPermission && (
          <PaymentEditModal
            payment={selectedPayment}
            show={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              handleSearch();
            }}
          />
        )
      }
      {hasEditPermission && (
        <DeleteConfirmationModal
          show={showDeleteModal}
          objectId={paymentToDelete?.id}
          onConfirm={confirmDelete}
          onClose={() => {
            setShowDeleteModal(false)
            setPaymentToDelete(null)
          }}
        />
      )}
    </div>
  );
};

export default PaymentManager;
