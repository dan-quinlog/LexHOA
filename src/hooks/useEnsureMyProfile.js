import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [ensureError, setEnsureError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { data, error, loading, refetch } = profileQuery;

  const retryInitialization = useCallback(() => {
    attemptedForUser.current = null;
    setEnsureError(false);
    setRetryCount(count => count + 1);
    refetch().catch(() => setEnsureError(true));
  }, [refetch]);

  useEffect(() => {
    if (!cognitoId) {
      attemptedForUser.current = null;
      setEnsureError(false);
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
    setEnsureError(false);
    let active = true;
    ensureMyProfile()
      .then(() => {
        if (active) {
          return refetch();
        }
        return undefined;
      })
      .catch(() => {
        if (active) {
          setEnsureError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [
    cognitoId,
    ensureMyProfile,
    data,
    error,
    loading,
    refetch,
    retryCount
  ]);

  return {
    profile: data?.profileByCognitoID?.items?.[0],
    initializationError: Boolean(error) || ensureError,
    retryInitialization
  };
}
