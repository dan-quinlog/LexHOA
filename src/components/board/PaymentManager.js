import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { LIST_PAYMENTS, PAYMENTS_BY_OWNER } from '../../queries/queries';
import { DELETE_PAYMENT } from '../../queries/mutations';
import PaymentEditModal from './PaymentEditModal';
import BoardCard from './shared/BoardCard';
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal';
import './shared/BoardTools.css';

const PaymentManager = ({ searchState, setSearchState }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

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
        <button onClick={() => {
          setSelectedPayment(null)
          setShowEditModal(true)
        }}>Create New</button>
      </div>
      <div className="results-grid">
        {searchState.searchResults.map(payment => (
          <BoardCard
            key={payment.id}
            header={<h3>Payment {payment.id}</h3>}
            content={
              <>
                <div>Account: {payment.ownerPaymentsId}</div>
                <div>Invoice ID: {payment.invoiceNumber}</div>
                <div>Amount: ${payment.invoiceAmount.toFixed(2)}</div>
                <div>Check Date: {payment.checkDate}</div>
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
      {
        showEditModal && (
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
      <DeleteConfirmationModal
        show={showDeleteModal}
        objectId={paymentToDelete?.id}
        onConfirm={confirmDelete}
        onClose={() => {
          setShowDeleteModal(false)
          setPaymentToDelete(null)
        }}
      />
    </div >
  );
};

export default PaymentManager;

