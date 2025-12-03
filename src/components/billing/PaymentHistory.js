import React from 'react';
import './PaymentHistory.css';

const PaymentHistory = ({ payments = [], loading = false }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      SUCCEEDED: 'status-success',
      PENDING: 'status-pending',
      PROCESSING: 'status-processing',
      FAILED: 'status-failed',
      CANCELED: 'status-canceled',
      REFUNDED: 'status-refunded'
    };
    return statusClasses[status] || 'status-pending';
  };

  const getPaymentMethodDisplay = (payment) => {
    switch (payment.paymentMethod) {
      case 'STRIPE_CARD':
        return 'Card Payment';
      case 'STRIPE_ACH':
        return 'Bank Transfer';
      case 'CHECK':
        return payment.checkNumber ? `Check #${payment.checkNumber}` : 'Check';
      case 'CASH':
        return 'Cash';
      default:
        return payment.checkNumber ? `Check #${payment.checkNumber}` : 'Payment';
    }
  };

  if (loading) {
    return (
      <div className="payment-history">
        <h3>Payment History</h3>
        <div className="loading">Loading payments...</div>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="payment-history">
        <h3>Payment History</h3>
        <div className="no-payments">No payment history available.</div>
      </div>
    );
  }

  return (
    <div className="payment-history">
      <h3>Payment History</h3>
      <div className="payments-list">
        {payments.map((payment) => (
          <div key={payment.id} className="payment-item">
            <div className="payment-header">
              <div className="payment-date">
                {formatDate(payment.createdAt || payment.checkDate)}
              </div>
              <span className={`payment-status ${getStatusBadge(payment.status)}`}>
                {payment.status || 'SUCCEEDED'}
              </span>
            </div>
            
            <div className="payment-details">
              <div className="payment-description">
                {payment.description || 'HOA Dues Payment'}
              </div>
              <div className="payment-method">
                {getPaymentMethodDisplay(payment)}
              </div>
            </div>

            <div className="payment-amounts">
              {payment.amount && (
                <div className="amount-row">
                  <span>Amount</span>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
              )}
              {payment.processingFee > 0 && (
                <div className="amount-row fee">
                  <span>Processing Fee</span>
                  <span>{formatCurrency(payment.processingFee)}</span>
                </div>
              )}
              <div className="amount-row total">
                <span>Total</span>
                <span>{formatCurrency(payment.totalAmount || payment.checkAmount || payment.amount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;
