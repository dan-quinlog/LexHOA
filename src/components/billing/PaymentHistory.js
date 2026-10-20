import React from 'react';
import './PaymentHistory.css';

const INVOICE_TYPE_LABELS = {
  DUES: 'Dues',
  ASSESSMENT: 'Assessment',
  LATE_FEE: 'Late Fee',
  ADJUSTMENT: 'Adjustment'
};

// AWSDate values ("2026-11-01") are calendar dates; parse them as local dates so they
// do not shift to the previous day in timezones west of UTC.
const parseDate = (value) => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
};

const PaymentHistory = ({ payments = [], invoices = [], loading = false }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (value) => {
    const date = parseDate(value);
    if (!date) return '-';
    return date.toLocaleDateString('en-US', {
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
      case 'CARD':
        return 'Card Payment';
      case 'BANK_ACCOUNT':
        return 'Bank Transfer (eCheck)';
      case 'CHECK':
        return payment.checkNumber ? `Check #${payment.checkNumber}` : 'Check';
      case 'CASH':
        return 'Cash';
      default:
        return payment.checkNumber ? `Check #${payment.checkNumber}` : 'Payment';
    }
  };

  const renderPayment = (payment, date) => (
    <div key={`payment-${payment.id}`} className="payment-item">
      <div className="payment-header">
        <div className="payment-date">{formatDate(date)}</div>
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
  );

  const renderInvoice = (invoice) => {
    const voided = invoice.status === 'VOID';
    const typeLabel = INVOICE_TYPE_LABELS[invoice.type] || 'Invoice';
    const isCredit = invoice.totalAmount < 0;
    const details = [`Invoice ${invoice.invoiceNumber}`, `Due ${formatDate(invoice.dateDue)}`];
    if (!invoice.balanceApplied) details.push('Not applied to balance');

    return (
      <div
        key={`invoice-${invoice.id}`}
        className={`payment-item invoice-item${voided ? ' invoice-void' : ''}`}
      >
        <div className="payment-header">
          <div className="payment-date">{formatDate(invoice.dateApplied)}</div>
          <span className={`payment-status ${voided ? 'status-canceled' : 'status-invoice'}`}>
            {voided ? 'Void' : typeLabel}
          </span>
        </div>

        <div className="payment-details">
          <div className="payment-description">
            {invoice.description || `${typeLabel} invoice`}
          </div>
          <div className="payment-method">{details.join(' · ')}</div>
        </div>

        <div className="payment-amounts">
          {(invoice.lineItems || []).map((item, index) => (
            <div key={item.propertyId || index} className="amount-row">
              <span>{item.address || item.description || typeLabel}</span>
              <span>{formatCurrency(item.amount)}</span>
            </div>
          ))}
          <div className="amount-row total">
            <span>{isCredit ? 'Credit' : 'Amount Charged'}</span>
            <span>{formatCurrency(Math.abs(invoice.totalAmount))}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="payment-history">
        <h3>Billing History</h3>
        <div className="loading">Loading billing history...</div>
      </div>
    );
  }

  const entries = [
    ...payments.map((payment) => {
      const date = payment.checkDate || payment.createdAt;
      return { date, render: () => renderPayment(payment, date) };
    }),
    ...invoices.map((invoice) => ({
      date: invoice.dateApplied,
      render: () => renderInvoice(invoice)
    }))
  ].sort((a, b) => (parseDate(b.date) || 0) - (parseDate(a.date) || 0));

  if (entries.length === 0) {
    return (
      <div className="payment-history">
        <h3>Billing History</h3>
        <div className="no-payments">No billing history available.</div>
      </div>
    );
  }

  return (
    <div className="payment-history">
      <h3>Billing History</h3>
      <div className="payments-list">
        {entries.map((entry) => entry.render())}
      </div>
    </div>
  );
};

export default PaymentHistory;
