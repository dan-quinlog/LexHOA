import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { PROFILE_BY_COGNITO_ID } from '../queries/queries';
import { ENSURE_MY_PROFILE } from '../queries/mutations';

export default function useEnsureMyProfile(user, client) {
  const cognitoId = user?.userId || user?.username;
  const profileQuery = useQuery(PROFILE_BY_COGNITO_ID, {
    variables: { cognitoID: cognitoId },
    skip: !user,
    client
  });
  const [ensureMyProfile] = useMutation(ENSURE_MY_PROFILE, { client });
  const attemptedForUser = useRef(null);
  const { data, error, loading, refetch } = profileQuery;

  useEffect(() => {
    if (!cognitoId) {
      attemptedForUser.current = null;
      return;
    }

    const profiles = data?.profileByCognitoID?.items;
    const isDefinitivelyEmpty = !loading
      && !error
      && Array.isArray(profiles)
      && profiles.length === 0;

    if (!isDefinitivelyEmpty || attemptedForUser.current === cognitoId) {
      return;
    }

    attemptedForUser.current = cognitoId;
    let active = true;
    ensureMyProfile()
      .then(() => {
        if (active) {
          return refetch();
        }
        return undefined;
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [
    cognitoId,
    ensureMyProfile,
    data,
    error,
    loading,
    refetch
  ]);

  return data?.profileByCognitoID?.items?.[0];
}
