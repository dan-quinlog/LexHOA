import React from 'react';
import './AccountCard.css';

const AccountCard = ({ account, onEdit }) => {
  return (
    <div className="account-card">
      <div className="card-header">
        <h3>{account.id}</h3>
        <p>Owner ID: {account.accountOwnerId}</p>
      </div>
      <div className="card-content">
        <p>Balance: ${account.balance.toFixed(2)}</p>
      </div>
    </div>
  );
};
export default AccountCard;