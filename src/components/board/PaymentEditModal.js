import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_PAYMENT } from '../../queries/mutations';
import Modal from '../shared/Modal';

const PaymentEditModal = ({ payment, onClose, show }) => {
  const [formData, setFormData] = useState({
    checkDate: payment?.checkDate || '',
    checkNumber: payment?.checkNumber || '',
    amount: payment?.amount || '',
    ownerID: payment?.ownerID || '',
    notes: payment?.notes || ''
  });

  const [updatePayment] = useMutation(UPDATE_PAYMENT);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePayment({
        variables: {
          input: {
            id: payment.id,
            ...formData
          }
        }
      });
      onClose();
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="payment-edit-modal">
        <h2>Edit Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Check Date:</label>
            <input
              type="date"
              name="checkDate"
              value={formData.checkDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Check Number:</label>
            <input
              type="text"
              name="checkNumber"
              value={formData.checkNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Check Amount:</label>
            <input
              type="number"
              name="checkAmount"
              value={formData.checkAmount}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Invoice Number:</label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Invoice Amount:</label>
            <input
              type="number"
              name="invoiceAmount"
              value={formData.invoiceAmount}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Owner ID:</label>
            <input
              type="text"
              name="ownerPaymentsId"
              value={formData.ownerPaymentsId}
              onChange={handleChange}
              disabled
            />
          </div>
          <div className="modal-actions">
            <button onClick={handleSubmit}>
              {payment?.id ? 'Save' : 'Create'}
            </button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentEditModal;