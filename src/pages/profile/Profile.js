import React, { useState } from 'react';
import ProfileEditModal from '../../components/user/ProfileEditModal';import { useQuery } from '@apollo/client';
import {
  GET_ACCOUNT_BY_OWNER,
  SEARCH_PROPERTIES_BY_ACCOUNT,
  SEARCH_PROPERTIES_BY_TENANT,
  GET_PROFILE
} from '../../queries/queries'; import PersonCard from '../../components/user/PersonCard';
import AccountCard from '../../components/user/AccountCard';
import PropertyCard from '../../components/user/PropertyCard';
import './Profile.css';

const Profile = ({ cognitoId }) => {
  const [showEditModal, setShowEditModal] = useState(false);

  // Get person data first
  const { data: personData } = useQuery(GET_PROFILE, {
    variables: { cognitoID: cognitoId },
    skip: !cognitoId
  });

  // Get account using person data
  const { data: accountData } = useQuery(GET_ACCOUNT_BY_OWNER, {
    variables: { accountOwnerId: personData?.personByCognitoID?.items[0]?.id },
    skip: !personData?.personByCognitoID?.items[0]?.id
  });

  // Get property using account data
  const { data: propertyData } = useQuery(SEARCH_PROPERTIES_BY_ACCOUNT, {
    variables: { accountPropertiesId: accountData?.accountByOwner?.items[0]?.id },
    skip: !accountData?.accountByOwner?.items[0]?.id
  });

  // Get property using tenant data
  const { data: tenantPropertyData } = useQuery(SEARCH_PROPERTIES_BY_TENANT, {
    variables: { propertyTenantId: personData?.personByCognitoID?.items[0]?.id },
    skip: !personData?.personByCognitoID?.items[0]?.id || accountData?.accountByOwner?.items?.length > 0
  });

  const isOwner = accountData?.accountByOwner?.items?.length > 0;
  const account = isOwner ? accountData.accountByOwner.items[0] : null;
  const property = isOwner ? propertyData?.propertyByAccount?.items[0] : tenantPropertyData?.propertyByTenant?.items[0];
    return (
      <div className="profile-page">
        <div className="profile-cards">
          <div className="profile-header">
            <h2>Profile</h2>
            <button
              className="edit-button"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
          </div>
          {personData?.personByCognitoID?.items[0] && (
            <>
              <PersonCard person={personData.personByCognitoID.items[0]} />
              <ProfileEditModal
                person={personData.personByCognitoID.items[0]}
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
              />
            </>
          )}
          {accountData?.accountByOwner?.items[0] && (
            <AccountCard account={accountData.accountByOwner.items[0]} />
          )}
          {propertyData?.propertyByAccount?.items?.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    );
  };

export default Profile;
