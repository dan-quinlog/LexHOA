import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useMutation } from '@apollo/client';
import { CREATE_STRIPE_PAYMENT_INTENT, CREATE_PAYMENT } from '../../queries/mutations';
import Modal from '../shared/Modal';
import './PaymentModal.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const SUGGESTED_AMOUNTS = {
  ANNUAL: { label: 'Annual', amount: 1200, description: '12 months' },
  SEMI: { label: '6-Month', amount: 600, description: '6 months' },
  QUARTERLY: { label: 'Quarterly', amount: 300, description: '3 months' },
  MONTHLY: { label: 'Monthly', amount: 100, description: '1 month' }
};

const PAYMENT_METHODS = {
  card: { 
    label: 'Credit/Debit Card', 
    description: '2.9% + $0.30 fee',
    icon: '💳'
  },
  us_bank_account: { 
    label: 'Bank Account (ACH)', 
    description: '0.8% fee (max $5.00)',
    icon: '🏦'
  }
};

const PaymentForm = ({ profileId, balance, email, onSuccess, onCancel, paymentMethodType }) => {
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
  const [createPayment] = useMutation(CREATE_PAYMENT);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  
  const isACH = paymentMethodType === 'us_bank_account';

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
          description: 'HOA Dues Payment',
          email: email || null,
          paymentMethodType: paymentMethodType || 'card'
        }
      });

      if (data?.createStripePaymentIntent) {
        setClientSecret(data.createStripePaymentIntent.clientSecret);
        setPaymentIntentId(data.createStripePaymentIntent.paymentIntentId);
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

    if (!stripe || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    let result;
    
    if (isACH) {
      // First, collect bank account using Financial Connections
      const { paymentIntent: collectResult, error: collectError } = await stripe.collectBankAccountForPayment({
        clientSecret,
        params: {
          payment_method_type: 'us_bank_account',
          payment_method_data: {
            billing_details: {
              name: email?.split('@')[0] || 'HOA Member',
              email: email
            }
          }
        },
        expand: ['payment_method']
      });

      if (collectError) {
        setError(collectError.message);
        setProcessing(false);
        return;
      }

      // If user closed the modal without completing
      if (collectResult.status === 'requires_payment_method') {
        setError('Bank account connection was cancelled. Please try again.');
        setProcessing(false);
        return;
      }

      // Now confirm the payment with the collected bank account
      if (collectResult.status === 'requires_confirmation') {
        result = await stripe.confirmUsBankAccountPayment(clientSecret);
      } else {
        // Payment is already processing or succeeded
        result = { paymentIntent: collectResult };
      }
    } else {
      if (!elements) {
        return;
      }
      const cardElement = elements.getElement(CardElement);
      result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      });
    }

    const { error: stripeError, paymentIntent } = result;

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
    } else if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
      try {
        await createPayment({
          variables: {
            input: {
              ownerPaymentsId: profileId,
              paymentMethod: isACH ? 'STRIPE_ACH' : 'STRIPE_CARD',
              stripePaymentIntentId: paymentIntentId,
              amount: paymentDetails.amount,
              processingFee: paymentDetails.processingFee,
              totalAmount: paymentDetails.totalAmount,
              status: paymentIntent.status === 'processing' ? 'PROCESSING' : 'SUCCEEDED',
              description: 'HOA Dues Payment',
              invoiceNumber: paymentIntentId,
              invoiceAmount: paymentDetails.amount
            }
          }
        });
      } catch (err) {
        console.warn('Payment record creation handled by webhook:', err.message);
      }
      
      setSucceeded(true);
      setProcessing(false);
      setTimeout(() => {
        onSuccess && onSuccess(paymentIntent);
      }, 2000);
    } else if (paymentIntent.status === 'requires_action') {
      setError('Additional verification required. Please follow the prompts.');
      setProcessing(false);
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
        <h3>{isACH ? 'Payment Processing!' : 'Payment Successful!'}</h3>
        <p>Your payment of {formatCurrency(paymentDetails?.totalAmount)} has been {isACH ? 'submitted' : 'processed'}.</p>
        {isACH && <p className="ach-notice">ACH payments typically take 2-3 business days to complete.</p>}
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
              <span>Processing Fee {isACH ? '(ACH)' : '(Card)'}</span>
              <span>{formatCurrency(paymentDetails.processingFee)}</span>
            </div>
            <div className="fee-row total">
              <span>Total</span>
              <span>{formatCurrency(paymentDetails.totalAmount)}</span>
            </div>
          </div>

          {isACH ? (
            <div className="ach-section">
              <h4>Bank Account</h4>
              <p className="ach-info">
                Click "Pay" to connect your bank account securely via Stripe.
                ACH payments have lower fees and typically take 2-3 business days.
              </p>
            </div>
          ) : (
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
          )}

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

const PaymentModal = ({ isOpen, onClose, profileId, balance, email, onPaymentSuccess }) => {
  const [paymentMethodType, setPaymentMethodType] = useState(null);
  
  const handleSuccess = (paymentIntent) => {
    onPaymentSuccess && onPaymentSuccess(paymentIntent);
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
          <Elements stripe={stripePromise}>
            <PaymentForm
              profileId={profileId}
              balance={balance}
              email={email}
              paymentMethodType={paymentMethodType}
              onSuccess={handleSuccess}
              onCancel={handleClose}
            />
          </Elements>
        </>
      )}
    </Modal>
  );
};

export default PaymentModal;
