import React from 'react';

const ProfileDisplay = ({ profile }) => {
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
            <div>{profile.address1}</div>
            {profile.address2 && <div>{profile.address2}</div>}
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
          <div className="field-label">Phone (Call)</div>
          <div className="field-value">{profile.phoneCall}</div>
        </div>

        <div className="field-group">
          <div className="field-label">Phone (Text)</div>
          <div className="field-value">{profile.phoneText}</div>
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