import React from 'react';
import { Link } from 'react-router-dom';
import './BalanceCard.css';

const BalanceCard = ({ balance = 0, billingFreq = 'MONTHLY' }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const hasBalance = balance > 0;

  return (
    <div className="balance-card">
      <div className="balance-header">
        <h3>Account Balance</h3>
      </div>
      <div className="balance-content">
        <div className={`balance-amount ${hasBalance ? 'has-balance' : 'zero-balance'}`}>
          {formatCurrency(balance)}
        </div>
        {hasBalance ? (
          <p className="balance-status">Amount Due</p>
        ) : (
          <p className="balance-status paid">Paid in Full</p>
        )}
      </div>
      <div className="balance-actions">
        <Link to="/billing" className="billing-link">
          {hasBalance ? 'Make a Payment' : 'View Billing History'}
        </Link>
      </div>
    </div>
  );
};

export default BalanceCard;
