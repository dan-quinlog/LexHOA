import React from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_ACCOUNT_BY_OWNER,
  SEARCH_PROPERTIES_BY_ACCOUNT,
  SEARCH_PROPERTIES_BY_TENANT,
  GET_PROFILE
} from '../../queries/queries'; import PersonCard from '../../components/user/PersonCard';
import AccountCard from '../../components/user/AccountCard';
import PropertyCard from '../../components/user/PropertyCard';
import '../../components/user/UserCards.css';
import './Profile.css';

const Profile = ({ cognitoId }) => {
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
          {personData?.personByCognitoID?.items[0] && (
            <PersonCard person={personData.personByCognitoID.items[0]} />
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
