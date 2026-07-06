import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_AUTHNET_TRANSACTION, CREATE_PAYMENT } from '../../queries/mutations';
import Modal from '../shared/Modal';
import './PaymentModal.css';

const AUTHNET_CLIENT_KEY = process.env.REACT_APP_AUTHNET_CLIENT_KEY;
const AUTHNET_API_LOGIN_ID = process.env.REACT_APP_AUTHNET_API_LOGIN_ID;
const AUTHNET_ENVIRONMENT = process.env.REACT_APP_AUTHNET_ENVIRONMENT || 'sandbox';

const ACCEPT_JS_URL = AUTHNET_ENVIRONMENT === 'production'
  ? 'https://js.authorize.net/v1/Accept.js'
  : 'https://jstest.authorize.net/v1/Accept.js';

const BASE_AMOUNTS = {
  ANNUAL: { label: 'Annual', baseAmount: 1200, description: '12 months' },
  SEMI: { label: '6-Month', baseAmount: 600, description: '6 months' },
  QUARTERLY: { label: 'Quarterly', baseAmount: 300, description: '3 months' },
  MONTHLY: { label: 'Monthly', baseAmount: 100, description: '1 month' }
};

const PAYMENT_METHODS = {
  card: { 
    label: 'Credit/Debit Card', 
    description: '2.9% + $0.30 fee',
    icon: '💳'
  },
  bank_account: { 
    label: 'Bank Account (eCheck)', 
    description: '0.8% fee (max $5.00)',
    icon: '🏦'
  }
};

const PaymentForm = ({ profileId, balance, email, onSuccess, onCancel, paymentMethodType, propertyCount = 1 }) => {
  const [selectedAmount, setSelectedAmount] = useState('CUSTOM');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [acceptJsLoaded, setAcceptJsLoaded] = useState(false);

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
  const [createPayment] = useMutation(CREATE_PAYMENT);
  
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

  // Calculate suggested amounts based on number of properties
  const suggestedAmounts = Object.entries(BASE_AMOUNTS).reduce((acc, [key, value]) => {
    acc[key] = {
      ...value,
      amount: value.baseAmount * propertyCount,
      description: propertyCount > 1 
        ? `${value.description} × ${propertyCount} properties` 
        : value.description
    };
    return acc;
  }, {});

  const getPaymentAmount = () => {
    if (selectedAmount === 'CUSTOM') {
      return parseFloat(customAmount) || 0;
    }
    return suggestedAmounts[selectedAmount]?.amount || 0;
  };

  const calculateFee = (amount) => {
    if (isACH) {
      return Math.min(amount * 0.008, 5.00);
    }
    return (amount * 0.029) + 0.30;
  };

  const handleAmountSelect = (key) => {
    setSelectedAmount(key);
    setError(null);
    setPaymentDetails(null);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(value);
    setError(null);
    setPaymentDetails(null);
  };

  const handlePreparePayment = () => {
    const amount = getPaymentAmount();
    if (amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const fee = calculateFee(amount);
    const total = Math.round((amount + fee) * 100) / 100;

    setPaymentDetails({
      amount: amount,
      processingFee: Math.round(fee * 100) / 100,
      totalAmount: total
    });
  };

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

    if (!acceptJsLoaded || !paymentDetails) {
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
          amount: paymentDetails.amount,
          profileId,
          description: 'HOA Dues Payment',
          email: email || null,
          paymentMethodType: paymentMethodType || 'card',
          opaqueDataDescriptor,
          opaqueDataValue
        }
      });

      const result = data?.createAuthNetTransaction;
      if (!result || !result.transactionId) {
        throw new Error(result?.messageText || 'Transaction failed');
      }

      // Step 3: Create payment record
      const today = new Date().toISOString().split('T')[0];
      
      try {
        await createPayment({
          variables: {
            input: {
              ownerPaymentsId: profileId,
              paymentMethod: isACH ? 'BANK_ACCOUNT' : 'CARD',
              authNetTransactionId: result.transactionId,
              amount: paymentDetails.amount,
              processingFee: paymentDetails.processingFee,
              totalAmount: paymentDetails.totalAmount,
              // Card payments settle instantly; eCheck (ACH) takes 1-5 business
              // days to clear, so it starts PENDING and is reconciled later.
              status: isACH ? 'PENDING' : 'SUCCEEDED',
              description: 'HOA Dues Payment',
              invoiceNumber: result.transactionId,
              invoiceAmount: paymentDetails.amount,
              checkDate: today,
              checkAmount: paymentDetails.amount
            }
          }
        });
      } catch (err) {
        console.warn('Payment record creation error (may be handled by webhook):', err.message);
      }

      setSucceeded(true);
      setProcessing(false);
      setTimeout(() => {
        onSuccess && onSuccess({ transactionId: result.transactionId, amount: paymentDetails.amount });
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
          {Object.entries(suggestedAmounts).map(([key, { label, amount, description }]) => (
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
          <button
            type="button"
            className={`amount-option custom ${selectedAmount === 'CUSTOM' ? 'selected' : ''}`}
            onClick={() => handleAmountSelect('CUSTOM')}
          >
            <span className="amount-label">Custom</span>
            <input
              type="text"
              placeholder="0.00"
              value={customAmount}
              onChange={handleCustomAmountChange}
              onClick={(e) => e.stopPropagation()}
              className="custom-amount-input"
            />
          </button>
        </div>
      </div>

      {!paymentDetails && (
        <button
          type="button"
          onClick={handlePreparePayment}
          disabled={processing || getPaymentAmount() <= 0}
          className="prepare-payment-btn"
        >
          Continue to Payment
        </button>
      )}

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

const PaymentModal = ({ isOpen, onClose, profileId, balance, email, propertyCount = 1, onPaymentSuccess }) => {
  const [paymentMethodType, setPaymentMethodType] = useState(null);
  
  const handleSuccess = (result) => {
    onPaymentSuccess && onPaymentSuccess(result);
    setPaymentMethodType(null);
    onClose();
  };

  const handleClose = () => {
    setPaymentMethodType(null);
    onClose();
  };

  const handleBack = () => {
    setPaymentMethodType(null);
  };

  return (
    <Modal show={isOpen} onClose={handleClose}>
      <h2>Make a Payment</h2>
      
      {!paymentMethodType ? (
        <div className="payment-method-selection">
          <h4>Select Payment Method</h4>
          <div className="payment-method-options">
            {Object.entries(PAYMENT_METHODS).map(([key, { label, description, icon }]) => (
              <button
                key={key}
                type="button"
                className="payment-method-option"
                onClick={() => setPaymentMethodType(key)}
              >
                <span className="payment-method-icon">{icon}</span>
                <span className="payment-method-label">{label}</span>
                <span className="payment-method-desc">{description}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={handleClose} className="cancel-btn">
            Cancel
          </button>
        </div>
      ) : (
        <>
          <button type="button" onClick={handleBack} className="back-btn">
            ← Change Payment Method
          </button>
          <PaymentForm
            profileId={profileId}
            balance={balance}
            email={email}
            propertyCount={propertyCount}
            paymentMethodType={paymentMethodType}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </>
      )}
    </Modal>
  );
};

export default PaymentModal;
