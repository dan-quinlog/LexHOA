import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_AUTHNET_TRANSACTION } from '../../queries/mutations';
import Modal from '../shared/Modal';
import './PaymentModal.css';

const AUTHNET_CLIENT_KEY = process.env.REACT_APP_AUTHNET_CLIENT_KEY;
const AUTHNET_API_LOGIN_ID = process.env.REACT_APP_AUTHNET_API_LOGIN_ID;
const AUTHNET_ENVIRONMENT = process.env.REACT_APP_AUTHNET_ENVIRONMENT || 'sandbox';

const ACCEPT_JS_URL = AUTHNET_ENVIRONMENT === 'production'
  ? 'https://js.authorize.net/v1/Accept.js'
  : 'https://jstest.authorize.net/v1/Accept.js';

const SUGGESTED_AMOUNTS = {
  MONTHLY: { label: '1 Month', amount: 100, description: 'Monthly dues' },
  QUARTERLY: { label: '1 Quarter', amount: 300, description: '3 months' },
  SEMI_ANNUAL: { label: '1 Half-Year', amount: 600, description: '6 months' },
  ANNUAL: { label: '1 Year', amount: 1200, description: '12 months' }
};

const PAYMENT_METHODS = {
  card: { 
    label: 'Credit/Debit Card', 
    description: '2.9% + $0.30 fee'
  },
  bank_account: { 
    label: 'Bank Account (eCheck)', 
    description: '0.8% fee (max $5.00)'
  }
};

const PaymentForm = ({ profileId, balance, onSuccess, onCancel }) => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethodType, setPaymentMethodType] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [acceptJsLoaded, setAcceptJsLoaded] = useState(false);
  const idempotencyKeyRef = useRef(null);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');

  // Bank account fields
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [nameOnAccount, setNameOnAccount] = useState('');
  const [accountType, setAccountType] = useState('checking');

  const [createAuthNetTransaction] = useMutation(CREATE_AUTHNET_TRANSACTION);
  
  const isACH = paymentMethodType === 'bank_account';

  // Load Accept.js script
  useEffect(() => {
    if (document.querySelector(`script[src="${ACCEPT_JS_URL}"]`)) {
      setAcceptJsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = ACCEPT_JS_URL;
    script.async = true;
    script.onload = () => setAcceptJsLoaded(true);
    script.onerror = () => setError('Failed to load payment processor');
    document.head.appendChild(script);

    return () => {
      // Don't remove — other instances may need it
    };
  }, []);

  const getPaymentAmount = () => {
    if (selectedAmount === 'CUSTOM') {
      return Number(customAmount) || 0;
    }
    return SUGGESTED_AMOUNTS[selectedAmount]?.amount || 0;
  };

  const calculateFee = (amount) => {
    if (isACH) {
      return Math.min(amount * 0.008, 5.00);
    }
    return (amount * 0.029) + 0.30;
  };

  const getPaymentDetails = () => {
    const amount = getPaymentAmount();
    const fee = calculateFee(amount);
    return {
      amount,
      processingFee: Math.round(fee * 100) / 100,
      totalAmount: Math.round((amount + fee) * 100) / 100
    };
  };

  const handleAmountSelect = (key) => {
    setSelectedAmount(key);
    setPaymentMethodType(null);
    setError(null);
    idempotencyKeyRef.current = null;
  };

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount('CUSTOM');
    setPaymentMethodType(null);
    setError(null);
    idempotencyKeyRef.current = null;
  };

  const handlePaymentMethodSelect = (method) => {
    const amount = getPaymentAmount();
    if (amount <= 0) {
      setError('Please select or enter a valid payment amount first.');
      return;
    }
    if (amount > Number(balance)) {
      setError('Payment amount cannot exceed the current balance.');
      return;
    }
    setPaymentMethodType(method);
    setError(null);
    idempotencyKeyRef.current = null;
  };

  const paymentDetails = paymentMethodType ? getPaymentDetails() : null;

  const dispatchAcceptJs = () => {
    return new Promise((resolve, reject) => {
      const secureData = {
        authData: {
          clientKey: AUTHNET_CLIENT_KEY,
          apiLoginID: AUTHNET_API_LOGIN_ID
        }
      };

      if (isACH) {
        secureData.bankData = {
          routingNumber: routingNumber,
          accountNumber: accountNumber,
          nameOnAccount: nameOnAccount,
          accountType: accountType
        };
      } else {
        secureData.cardData = {
          cardNumber: cardNumber.replace(/\s/g, ''),
          month: expMonth,
          year: expYear,
          cardCode: cvv
        };
      }

      window.Accept.dispatchData(secureData, (response) => {
        if (response.messages.resultCode === 'Error') {
          const errors = response.messages.message.map(m => m.text).join(', ');
          reject(new Error(errors));
        } else {
          resolve({
            opaqueDataDescriptor: response.opaqueData.dataDescriptor,
            opaqueDataValue: response.opaqueData.dataValue
          });
        }
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptJsLoaded || !paymentDetails || paymentDetails.amount > Number(balance)) {
      if (paymentDetails?.amount > Number(balance)) {
        setError('Payment amount cannot exceed the current balance.');
      }
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Tokenize payment data via Accept.js
      const { opaqueDataDescriptor, opaqueDataValue } = await dispatchAcceptJs();

      // Step 2: Send token to backend to create the transaction
      const { data } = await createAuthNetTransaction({
        variables: {
          profileId,
          idempotencyKey: idempotencyKeyRef.current || (idempotencyKeyRef.current = crypto.randomUUID()),
          expectedAmount: paymentDetails.amount,
          paymentMethodType: paymentMethodType || 'card',
          opaqueDataDescriptor,
          opaqueDataValue
        }
      });

      const result = data?.createAuthNetTransaction;
      if (!result || !result.transactionId) {
        throw new Error(result?.messageText || 'Transaction failed');
      }

      setSucceeded(true);
      setProcessing(false);
      setTimeout(() => {
        onSuccess && onSuccess({ transactionId: result.transactionId, amount: result.amount, totalAmount: result.totalAmount });
      }, 2000);

    } catch (err) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  if (succeeded) {
    return (
      <div className="payment-success">
        <div className="success-icon">✓</div>
        <h3>{isACH ? 'Payment Submitted!' : 'Payment Successful!'}</h3>
        <p>Your payment of {formatCurrency(paymentDetails?.totalAmount)} has been {isACH ? 'submitted' : 'processed'}.</p>
        {isACH && <p className="ach-notice">eCheck payments may take 2-3 business days to settle. Your balance reflects this payment as pending until it clears.</p>}
        <p>A receipt will be sent to your email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="amount-section">
        <h4>Select Payment Amount</h4>
        <p className="balance-info">Current Balance: {formatCurrency(balance)}</p>
        <div className="amount-options">
          {Object.entries(SUGGESTED_AMOUNTS).map(([key, { label, amount, description }]) => (
            <button
              key={key}
              type="button"
              className={`amount-option ${selectedAmount === key ? 'selected' : ''}`}
              onClick={() => handleAmountSelect(key)}
            >
              <span className="amount-label">{label}</span>
              <span className="amount-value">{formatCurrency(amount)}</span>
              <span className="amount-desc">{description}</span>
            </button>
          ))}
          <div className={`amount-option custom ${selectedAmount === 'CUSTOM' ? 'selected' : ''}`}>
            <label htmlFor="custom-payment-amount" className="amount-label">Custom Amount</label>
            <input
              id="custom-payment-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={customAmount}
              onChange={handleCustomAmountChange}
              onFocus={() => handleAmountSelect('CUSTOM')}
              className="custom-amount-input"
            />
          </div>
        </div>
      </div>

      <div className="payment-method-selection">
        <h4>Select Payment Method</h4>
        <div className="payment-method-options">
          {Object.entries(PAYMENT_METHODS).map(([key, { label, description }]) => (
            <button
              key={key}
              type="button"
              className={`payment-method-option ${paymentMethodType === key ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect(key)}
            >
              <span className="payment-method-copy">
                <span className="payment-method-label">{label}</span>
                <span className="payment-method-desc">{description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {paymentDetails && (
        <>
          <div className="fee-breakdown">
            <div className="fee-row">
              <span>HOA Dues</span>
              <span>{formatCurrency(paymentDetails.amount)}</span>
            </div>
            <div className="fee-row">
              <span>Processing Fee {isACH ? '(eCheck)' : '(Card)'}</span>
              <span>{formatCurrency(paymentDetails.processingFee)}</span>
            </div>
            <div className="fee-row total">
              <span>Total</span>
              <span>{formatCurrency(paymentDetails.totalAmount)}</span>
            </div>
          </div>

          {isACH ? (
            <div className="ach-section">
              <h4>Bank Account Details</h4>
              <div className="form-field">
                <label>Name on Account</label>
                <input
                  type="text"
                  value={nameOnAccount}
                  onChange={(e) => setNameOnAccount(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-field">
                <label>Routing Number</label>
                <input
                  type="text"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="123456789"
                  maxLength="9"
                  required
                />
              </div>
              <div className="form-field">
                <label>Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                  placeholder="Account number"
                  required
                />
              </div>
              <div className="form-field">
                <label>Account Type</label>
                <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="card-section">
              <h4>Card Details</h4>
              <div className="form-field">
                <label>Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4111 1111 1111 1111"
                  maxLength="19"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Month</label>
                  <input
                    type="text"
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    placeholder="MM"
                    maxLength="2"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Year</label>
                  <input
                    type="text"
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="YYYY"
                    maxLength="4"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!acceptJsLoaded || processing}
            className="submit-payment-btn"
          >
            {processing ? 'Processing...' : `Pay ${formatCurrency(paymentDetails.totalAmount)}`}
          </button>
        </>
      )}

      {error && <div className="payment-error">{error}</div>}

      <button type="button" onClick={onCancel} className="cancel-btn">
        Cancel
      </button>
    </form>
  );
};

const PaymentModal = ({ isOpen, onClose, profileId, balance, onPaymentSuccess }) => {
  const handleSuccess = (result) => {
    onPaymentSuccess && onPaymentSuccess(result);
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <h2>Make a Payment</h2>
      <PaymentForm
        profileId={profileId}
        balance={balance}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default PaymentModal;
