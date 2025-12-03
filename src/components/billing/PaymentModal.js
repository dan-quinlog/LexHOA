import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useMutation } from '@apollo/client';
import { CREATE_STRIPE_PAYMENT_INTENT } from '../../queries/mutations';
import Modal from '../shared/Modal';
import './PaymentModal.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const SUGGESTED_AMOUNTS = {
  ANNUAL: { label: 'Annual', amount: 1200, description: '12 months' },
  SEMI: { label: '6-Month', amount: 600, description: '6 months' },
  QUARTERLY: { label: 'Quarterly', amount: 300, description: '3 months' },
  MONTHLY: { label: 'Monthly', amount: 100, description: '1 month' }
};

const PaymentForm = ({ profileId, balance, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedAmount, setSelectedAmount] = useState('CUSTOM');
  const [customAmount, setCustomAmount] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  const [createPaymentIntent] = useMutation(CREATE_STRIPE_PAYMENT_INTENT);

  const getPaymentAmount = () => {
    if (selectedAmount === 'CUSTOM') {
      return parseFloat(customAmount) || 0;
    }
    return SUGGESTED_AMOUNTS[selectedAmount]?.amount || 0;
  };

  const handleAmountSelect = (key) => {
    setSelectedAmount(key);
    setError(null);
    setClientSecret('');
    setPaymentDetails(null);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(value);
    setError(null);
    setClientSecret('');
    setPaymentDetails(null);
  };

  const handlePreparePayment = async () => {
    const amount = getPaymentAmount();
    if (amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { data } = await createPaymentIntent({
        variables: {
          amount,
          profileId,
          description: 'HOA Dues Payment'
        }
      });

      if (data?.createStripePaymentIntent) {
        setClientSecret(data.createStripePaymentIntent.clientSecret);
        setPaymentDetails({
          amount: data.createStripePaymentIntent.amount,
          processingFee: data.createStripePaymentIntent.processingFee,
          totalAmount: data.createStripePaymentIntent.totalAmount
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to prepare payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement
        }
      }
    );

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      setSucceeded(true);
      setProcessing(false);
      setTimeout(() => {
        onSuccess && onSuccess(paymentIntent);
      }, 2000);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (succeeded) {
    return (
      <div className="payment-success">
        <div className="success-icon">✓</div>
        <h3>Payment Successful!</h3>
        <p>Your payment of {formatCurrency(paymentDetails?.totalAmount)} has been processed.</p>
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

      {!clientSecret && (
        <button
          type="button"
          onClick={handlePreparePayment}
          disabled={processing || getPaymentAmount() <= 0}
          className="prepare-payment-btn"
        >
          {processing ? 'Calculating...' : 'Continue to Payment'}
        </button>
      )}

      {clientSecret && paymentDetails && (
        <>
          <div className="fee-breakdown">
            <div className="fee-row">
              <span>HOA Dues</span>
              <span>{formatCurrency(paymentDetails.amount)}</span>
            </div>
            <div className="fee-row">
              <span>Processing Fee</span>
              <span>{formatCurrency(paymentDetails.processingFee)}</span>
            </div>
            <div className="fee-row total">
              <span>Total</span>
              <span>{formatCurrency(paymentDetails.totalAmount)}</span>
            </div>
          </div>

          <div className="card-section">
            <h4>Card Details</h4>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#333',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#d32f2f',
                  },
                },
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!stripe || processing}
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
  const handleSuccess = (paymentIntent) => {
    onPaymentSuccess && onPaymentSuccess(paymentIntent);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Make a Payment">
      <Elements stripe={stripePromise}>
        <PaymentForm
          profileId={profileId}
          balance={balance}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </Elements>
    </Modal>
  );
};

export default PaymentModal;
