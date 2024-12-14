import React from 'react';

const ProfileDisplay = ({ profile }) => {
  // Split address into lines
  const [addressLine1, addressLine2] = profile.address ? profile.address.split('|') : ['', ''];

  return (
    <div className="profile-content">
      <div className="left-column">
        <div className="field-group">
          <div className="field-label">Name</div>
          <div className="field-value">{profile.name}</div>
        </div>
       
        <div className="field-group">
          <div className="field-label">Address</div>
          <div className="field-value">
            <div>{addressLine1}</div>
            {addressLine2 && <div>{addressLine2}</div>}
            <div>{`${profile.city}, ${profile.state} ${profile.zip}`}</div>
          </div>
        </div>
      </div>

      <div className="right-column">
        <div className="field-group">
          <div className="field-label">Email</div>
          <div className="field-value">{profile.email}</div>
        </div>

        <div className="field-group">
          <div className="field-label">Phone</div>
          <div className="field-value">
            {profile.phone}
            <div className="text-consent">
              {profile.allowText ? 'Text messages enabled' : 'No text consent'}
            </div>
          </div>
        </div>

        <div className="field-group">
          <div className="field-label">Contact Preference</div>
          <div className="field-value">{profile.contactPref}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDisplay;