import React from 'react';

const AccountCard = ({ account }) => {
  return (
    <div className="user-card account-card">
      <h3>Account Information</h3>
      <div className="card-content">
        <p>Account: {account.id}</p>
        <p>Balance: ${account.balance.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default AccountCard;

