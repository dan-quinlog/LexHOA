import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
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
    notes: payment?.notes || '',
    amount: payment?.amount || '',
    totalAmount: payment?.totalAmount || ''
  });
  
  const [applyPayment, setApplyPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [updatePayment] = useMutation(UPDATE_PAYMENT);
  const [createPayment] = useMutation(CREATE_PAYMENT);
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [getProfile] = useLazyQuery(GET_PROFILE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!formData.checkDate || !formData.checkNumber || !formData.checkAmount ||
        !formData.invoiceNumber || !formData.invoiceAmount || !formData.ownerPaymentsId) {
        setSubmitError('Complete all required payment fields.');
        return;
    }

    const input = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});
    
    // Ensure required Float! fields are set (amount and totalAmount are required by schema)
    const checkAmountValue = parseFloat(formData.checkAmount) || 0;
    if (!input.amount && input.amount !== 0) {
        input.amount = checkAmountValue;
    }
    if (!input.totalAmount && input.totalAmount !== 0) {
        input.totalAmount = checkAmountValue;
    }

    setIsSubmitting(true);
    try {
      if (payment?.id) {
          await updatePayment({
              variables: { input: { id: payment.id, ...input } }
          });
      } else {
          // Resolve the profile during submission so creation cannot race the query.
          const { data: profileData } = await getProfile({
              variables: { id: formData.ownerPaymentsId },
              fetchPolicy: 'network-only'
          });
          const targetProfile = profileData?.getProfile;
          if (targetProfile?.id !== formData.ownerPaymentsId || !targetProfile?.cognitoID) {
              throw new Error('Unable to resolve payment owner');
          }
          input.owner = targetProfile.cognitoID;
          input.status = 'SUCCEEDED';

          await createPayment({
              variables: { input }
          });
          
          // Apply payment to profile balance if checkbox is checked
          if (applyPayment && formData.ownerPaymentsId && formData.checkAmount) {
              const currentProfile = targetProfile;
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
    } catch (error) {
        console.error('Error processing payment:', error);
        setSubmitError('Unable to save payment. Verify the Owner ID and try again.');
        setIsSubmitting(false);
        return;
    }
    setIsSubmitting(false);
    onClose();
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
          {submitError && <div role="alert">{submitError}</div>}
          <div className="modal-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : payment?.id ? 'Save' : 'Create'}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentEditModal;
