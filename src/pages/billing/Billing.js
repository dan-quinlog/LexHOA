import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { PROFILE_BY_COGNITO_ID, PAYMENTS_BY_OWNER, INVOICES_BY_OWNER } from '../../queries/queries';
import PaymentModal from '../../components/billing/PaymentModal';
import PaymentHistory from '../../components/billing/PaymentHistory';
import { getPendingTotal, getEffectiveBalance } from '../../utils/payments';
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

  const { data: invoicesData, loading: invoicesLoading } = useQuery(
    INVOICES_BY_OWNER,
    {
      variables: {
        ownerInvoicesId: profile?.id,
        sortDirection: 'DESC',
        limit: 50
      },
      skip: !profile?.id
    }
  );

  const invoices = invoicesData?.invoicesByOwner?.items || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setShowPaymentModal(false);

    // Card payments reduce the balance server-side immediately. eCheck payments
    // are held as PENDING (balance unchanged) and shown as pending in the
    // displayed balance until they settle. Refetch to pick up both cases.
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

  const pendingTotal = getPendingTotal(payments);
  const effectiveBalance = getEffectiveBalance(profile.balance, pendingTotal);
  const hasPending = pendingTotal > 0;
  const hasBalance = effectiveBalance > 0;
  const hasCredit = effectiveBalance < 0;

  return (
    <div className="billing-page">
      <h2>Billing & Payments</h2>

      <div className="billing-content">
        <div className="balance-section">
          <div className="balance-card-large">
            <h3>Account Balance</h3>
            <div className={`balance-amount ${hasBalance ? 'has-balance' : 'zero-balance'}`}>
              {formatCurrency(Math.abs(effectiveBalance))}
              {hasPending && <span className="pending-asterisk">*</span>}
            </div>
            <p className={`balance-status ${hasBalance ? '' : 'paid'}`}>
              {hasBalance ? 'Amount Due' : hasCredit ? 'Account Credit' : 'Paid in Full - Thank You!'}
            </p>
            <button
              className="pay-now-btn"
              onClick={() => setShowPaymentModal(true)}
            >
              Make a Payment
            </button>
            {hasPending && (
              <p className="pending-note">*Including {formatCurrency(pendingTotal)} in pending payments</p>
            )}
          </div>

          <div className="dues-info">
            <h4>HOA Dues</h4>
            <div className="dues-row">
              <span>Per property, per year</span>
              <span>{formatCurrency(1000)}</span>
            </div>
          </div>
        </div>

        <div className="history-section">
          <PaymentHistory
            payments={payments}
            invoices={invoices}
            loading={paymentsLoading || invoicesLoading}
          />
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        profileId={profile.id}
        balance={profile.balance}
        email={profile.email}
        propertyCount={profile?.ownedProperties?.items?.length || 1}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Billing;
