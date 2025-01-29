const ProfileCard = ({ profile }) => {
  const [address1, address2] = profile.address ? profile.address.split('|') : ['', ''];
  const isOwner = profile.ownedProperties?.items?.length > 0;

  return (
    <div className="profile-content">
      <div className="field-group">
        <div className="field-label">Name</div>
        <div className="field-value">{profile.name}</div>
      </div>

      <div className="field-group">
        <div className="field-label">Email</div>
        <div className="field-value">{profile.email}</div>
      </div>

      <div className="field-group">
        <div className="field-label">Address</div>
        <div className="field-value">
          {address1}
          {address2 && <div>{address2}</div>}
          <div className="location-line">
            {profile.city} {profile.state} {profile.zip}
          </div>
        </div>
      </div>

      <div className="field-group">
        <div className="field-label">Contact Information</div>
        <div className="field-value">
          <div className="phone-text-group">
            <div>Phone: {profile.phone}</div>
          </div>
          <div>Preferred Contact: {profile.contactPref}</div>
        </div>
      </div>

      {isOwner && (
        <>
          <div className="field-group">
            <div className="field-label">Billing Frequency</div>
            <div className="field-value">{profile.billingFreq}</div>
          </div>

          <div className="field-group">
            <div className="field-label">Account Balance</div>
            <div className="field-value">${profile.balance}</div>
          </div>
        </>
      )}
    </div>
  );
};
export default ProfileCard;