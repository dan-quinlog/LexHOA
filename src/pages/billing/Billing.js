import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { PROFILE_BY_COGNITO_ID, PAYMENTS_BY_OWNER } from '../../queries/queries';
import PaymentModal from '../../components/billing/PaymentModal';
import PaymentHistory from '../../components/billing/PaymentHistory';
import './Billing.css';

const Billing = ({ cognitoId }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: profileData, loading: profileLoading, refetch: refetchProfile } = useQuery(
    PROFILE_BY_COGNITO_ID,
    {
      variables: { cognitoID: cognitoId },
      skip: !cognitoId
    }
  );

  const profile = profileData?.profileByCognitoID?.items[0];

  const { data: paymentsData, loading: paymentsLoading, refetch: refetchPayments } = useQuery(
    PAYMENTS_BY_OWNER,
    {
      variables: { 
        ownerPaymentsId: profile?.id,
        sortDirection: 'DESC',
        limit: 50
      },
      skip: !profile?.id
    }
  );

  const payments = paymentsData?.paymentsByOwner?.items || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    refetchProfile();
    refetchPayments();
  };

  if (profileLoading) {
    return (
      <div className="billing-page">
        <div className="loading">Loading billing information...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="billing-page">
        <div className="error">Unable to load profile information.</div>
      </div>
    );
  }

  const hasBalance = profile.balance > 0;

  return (
    <div className="billing-page">
      <h2>Billing & Payments</h2>

      <div className="billing-content">
        <div className="balance-section">
          <div className="balance-card-large">
            <h3>Account Balance</h3>
            <div className={`balance-amount ${hasBalance ? 'has-balance' : 'zero-balance'}`}>
              {formatCurrency(profile.balance)}
            </div>
            {hasBalance ? (
              <>
                <p className="balance-status">Amount Due</p>
                <button 
                  className="pay-now-btn"
                  onClick={() => setShowPaymentModal(true)}
                >
                  Make a Payment
                </button>
              </>
            ) : (
              <p className="balance-status paid">Paid in Full - Thank You!</p>
            )}
          </div>

          <div className="dues-info">
            <h4>HOA Dues Schedule</h4>
            <p className="billing-freq">
              Your billing frequency: <strong>{profile.billingFreq || 'MONTHLY'}</strong>
            </p>
            <div className="dues-amounts">
              <div className="dues-row">
                <span>Monthly</span>
                <span>{formatCurrency(100)}</span>
              </div>
              <div className="dues-row">
                <span>Quarterly (3 months)</span>
                <span>{formatCurrency(300)}</span>
              </div>
              <div className="dues-row">
                <span>Semi-Annual (6 months)</span>
                <span>{formatCurrency(600)}</span>
              </div>
              <div className="dues-row">
                <span>Annual (12 months)</span>
                <span>{formatCurrency(1200)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="history-section">
          <PaymentHistory 
            payments={payments} 
            loading={paymentsLoading} 
          />
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        profileId={profile.id}
        balance={profile.balance}
        email={profile.email}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Billing;
