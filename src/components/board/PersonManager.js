import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_PROFILE } from '../../queries/queries';
import ProfileEditForm from '../profile/ProfileEditForm';
import './PersonManager.css';
import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";
import { fetchAuthSession } from '@aws-amplify/auth';
import amplifyConfig from '../../config/amplify-config';

const searchCognitoUserByEmail = async (email) => {
  const credentials = await fetchAuthSession();
  const client = new CognitoIdentityProviderClient({
    region: amplifyConfig.aws_cognito_region,
    credentials: credentials.credentials
  });

  const command = new ListUsersCommand({
    UserPoolId: amplifyConfig.aws_user_pools_id,
    Filter: `email = "${email}"`
  });

  return client.send(command);
};

const PersonManager = () => {
  const [email, setEmail] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [searchProfile, { loading, data }] = useLazyQuery(GET_PROFILE);

  const handleSearch = async () => {
    try {
      console.log('Starting search for email:', email);
      const cognitoUser = await searchCognitoUserByEmail(email);
      console.log('Cognito user found:', cognitoUser);

      if (cognitoUser) {
        console.log('Searching profile with:', {
          email: email,
          cognitoId: cognitoUser.Username
        });

        await searchProfile({
          variables: {
            email: email,
            cognitoId: cognitoUser.Username
          }
        });
        setShowProfile(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="person-manager">
      <div className="search-section">
        <h2>Person Management</h2>
        <div className="search-box">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by email"
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {showProfile && data?.getPersonByCognitoId && (
        <div className="profile-section">
          <ProfileEditForm
            profile={data.getPersonByCognitoId}
            onCancel={() => setShowProfile(false)}
            onSave={() => {
              setShowProfile(false);
              setEmail('');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PersonManager;
