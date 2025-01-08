const AccountCard = ({ account }) => {
  return (
    <div className="user-card account-card">
      <h3>Account Information</h3>
      <div className="card-content">
        <p>Account Name: {account.accountName || 'Not Set'}</p>
        <p>Balance: ${account.balance?.toFixed(2) || '0.00'}</p>
        <p>Billing Frequency: {account.billingFreq || 'Not Set'}</p>
      </div>
    </div>
  );
};
export default AccountCard;