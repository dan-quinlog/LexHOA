import React from 'react';
import './AccountCard.css';

const AccountCard = ({ account, onEdit }) => {
  return (
    <div className="account-card">
      <div className="card-header">
        <h3>{account.accountName}</h3>
        <p>Account ID: {account.id}</p>
        <p>Owner ID: {account.accountOwnerId}</p>
      </div>
      <div className="card-content">
        <p>Billing Frequency: {account.billingFreq}</p>
        <p>Balance: ${account.balance}</p>
        <p>Created: {new Date(account.createdAt).toLocaleDateString()}</p>
        <p>Last Updated: {new Date(account.updatedAt).toLocaleDateString()}</p>
      </div>
      
      <div className="card-actions">
        <button className="edit-button" onClick={onEdit}>Edit</button>
      </div>
    </div>
  );
};

export default AccountCard;