import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ACCOUNT, UPDATE_ACCOUNT } from '../../queries/mutations';
import './AccountEditModal.css';
  const BILLING_OPTIONS = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'SEMI', label: 'Semiannually' },
    { value: 'ANNUAL', label: 'Annually' }
  ];

  const AccountEditModal = ({ account, onClose, show }) => {
    const [formData, setFormData] = useState({
      accountOwnerId: account?.accountOwnerId || '',
      billingFreq: account?.billingFreq || '',  // Changed from billingFrequency
      balance: account?.balance || 0,
    });

  const [updateAccount] = useMutation(UPDATE_ACCOUNT);
  const [createAccount] = useMutation(CREATE_ACCOUNT);
  const modalRef = useRef(null);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async () => {
    if (!formData.billingFreq || !formData.accountOwnerId) {
        console.log('Owner ID and Billing Frequency are required');
        return;
    }

    const input = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    if (account?.id) {
        await updateAccount({
            variables: { input: { id: account.id, ...input } }
        });
    } else {
        await createAccount({
            variables: { input }
        });
    }
    onClose();
};
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <h2>Edit Account</h2>
        <div className="form-container">
          <div className="form-section">
            <div className="form-group">
              <label>Owner ID*</label>
              <input type="text" value={formData.accountOwnerId} onChange={(e) => setFormData({ ...formData, accountOwnerId: e.target.value })} />
            </div>

            <div className="billing-line">
              <div className="form-group">
                <label>Billing Frequency*</label>
                <select 
                  value={formData.billingFreq} 
                  onChange={(e) => setFormData({ ...formData, billingFreq: e.target.value })}
                >
                  <option value="">Select Frequency</option>
                  {BILLING_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Balance</label>
                <div className="currency-input">
                  <span>$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={handleSubmit}>
            {account?.id ? 'Save' : 'Create'}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AccountEditModal;