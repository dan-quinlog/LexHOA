import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PAYMENT, UPDATE_PAYMENT, UPDATE_PROFILE } from '../../queries/mutations';
import { GET_PROFILE } from '../../queries/queries';
import Modal from '../shared/Modal';
import './PaymentEditModal.css';

const PaymentEditModal = ({ payment, onClose, show }) => {
  const [formData, setFormData] = useState({
    checkDate: payment?.checkDate || '',
    checkNumber: payment?.checkNumber || '',
    checkAmount: payment?.checkAmount || '',
    invoiceNumber: payment?.invoiceNumber || '',
    invoiceAmount: payment?.invoiceAmount || '',
    ownerPaymentsId: payment?.ownerPaymentsId || '',
    notes: payment?.notes || ''
  });
  
  const [applyPayment, setApplyPayment] = useState(false);

  const [updatePayment] = useMutation(UPDATE_PAYMENT);
  const [createPayment] = useMutation(CREATE_PAYMENT);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  
  // Get profile data when ownerPaymentsId is set (for applying payment)
  const { data: profileData } = useQuery(GET_PROFILE, {
    variables: { id: formData.ownerPaymentsId },
    skip: !formData.ownerPaymentsId || !applyPayment
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.checkDate || !formData.checkNumber || !formData.checkAmount ||
        !formData.invoiceNumber || !formData.invoiceAmount || !formData.ownerPaymentsId) {
        console.log('All fields except notes are required');
        return;
    }

    const input = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    try {
      if (payment?.id) {
          await updatePayment({
              variables: { input: { id: payment.id, ...input } }
          });
      } else {
          await createPayment({
              variables: { input }
          });
          
          // Apply payment to profile balance if checkbox is checked
          if (applyPayment && formData.ownerPaymentsId && formData.checkAmount) {
              const currentProfile = profileData?.getProfile;
              if (currentProfile) {
                  const currentBalance = parseFloat(currentProfile.balance || 0);
                  const paymentAmount = parseFloat(formData.checkAmount);
                  const newBalance = currentBalance - paymentAmount;
                  
                  await updateProfile({
                      variables: {
                          input: {
                              id: formData.ownerPaymentsId,
                              balance: newBalance
                          }
                      }
                  });
              }
          }
      }
      onClose();
    } catch (error) {
        console.error('Error processing payment:', error);
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
        <h2>{payment?.id ? 'Edit Payment' : 'Create Payment'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-container">
            <div className="form-section">
              <div className="form-group">
                <label>Check Number*</label>
                <input type="text" value={formData.checkNumber} onChange={(e) => setFormData({...formData, checkNumber: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Check Date*</label>
                <input type="date" value={formData.checkDate} onChange={(e) => setFormData({...formData, checkDate: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Check Amount*</label>
                <div className="currency-input">
                  <span>$</span>
                  <input type="number" step="0.01" value={formData.checkAmount} onChange={(e) => setFormData({...formData, checkAmount: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div className="form-group">
                <label>Invoice Number*</label>
                <input type="text" value={formData.invoiceNumber} onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Invoice Amount*</label>
                <div className="currency-input">
                  <span>$</span>
                  <input type="number" step="0.01" value={formData.invoiceAmount} onChange={(e) => setFormData({...formData, invoiceAmount: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div className="form-group">
                <label>Owner ID*</label>
                <input type="text" value={formData.ownerPaymentsId} onChange={(e) => setFormData({...formData, ownerPaymentsId: e.target.value})} />
              </div>
              
              {!payment?.id && (
                <div className="form-group apply-payment-section">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={applyPayment}
                      onChange={(e) => setApplyPayment(e.target.checked)}
                    />
                    Apply Payment (reduce profile balance by check amount)
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="modal-actions">
            <button type="submit">
              {payment?.id ? 'Save' : 'Create'}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentEditModal;