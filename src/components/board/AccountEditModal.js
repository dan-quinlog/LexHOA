import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_ACCOUNT } from '../../queries/mutations';
import './AccountEditModal.css';

const BILLING_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'SEMI', label: 'Semiannually' },
  { value: 'ANNUAL', label: 'Annually' }
];

const AccountEditModal = ({ account, show, onClose }) => {
  const [formData, setFormData] = useState({
    id: account.id,
    accountName: account.accountName,
    billingFreq: account.billingFreq,
    balance: account.balance
  });

  const [updateAccount] = useMutation(UPDATE_ACCOUNT);
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
    try {
      await updateAccount({
        variables: {
          input: formData
        }
      });
      onClose();
    } catch (err) {
      console.error('Error updating account:', err);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <h2>Edit Account</h2>
        <div className="form-group">
          <label>Account Name</label>
          <input
            type="text"
            name="accountName"
            value={formData.accountName}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Billing Frequency</label>
          <select
            name="billingFreq"
            value={formData.billingFreq}
            onChange={handleChange}
            className="form-select"
          >
            {BILLING_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Balance</label>
          <input
            type="number"
            name="balance"
            value={formData.balance}
            onChange={handleChange}
          />
        </div>
        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="save-button" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default AccountEditModal;