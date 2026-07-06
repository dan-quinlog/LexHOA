import React from 'react';
import { Link } from 'react-router-dom';
import { getEffectiveBalance } from '../../utils/payments';
import './BalanceCard.css';

const BalanceCard = ({ balance = 0, billingFreq = 'MONTHLY', pendingTotal = 0 }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const effectiveBalance = getEffectiveBalance(balance, pendingTotal);
  const hasPending = pendingTotal > 0;
  const hasBalance = effectiveBalance > 0;

  return (
    <div className="balance-card">
      <div className="balance-header">
        <h3>Account Balance</h3>
      </div>
      <div className="balance-content">
        <div className={`balance-amount ${hasBalance ? 'has-balance' : 'zero-balance'}`}>
          {formatCurrency(effectiveBalance)}
          {hasPending && <span className="pending-asterisk">*</span>}
        </div>
        {hasBalance ? (
          <p className="balance-status">Amount Due</p>
        ) : (
          <p className="balance-status paid">Paid in Full</p>
        )}
        {hasPending && (
          <p className="pending-note">*Including pending payments</p>
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
