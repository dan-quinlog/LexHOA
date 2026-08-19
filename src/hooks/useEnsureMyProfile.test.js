import { act, renderHook, waitFor } from '@testing-library/react';
import { useMutation, useQuery } from '@apollo/client';
import useEnsureMyProfile from './useEnsureMyProfile';

jest.mock('@apollo/client', () => ({
  gql: value => value,
  useMutation: jest.fn(),
  useQuery: jest.fn()
}));

describe('useEnsureMyProfile', () => {
  const user = { username: 'admin-created@example.invalid', userId: 'synthetic-sub' };
  let ensureMyProfile;
  let refetch;

  beforeEach(() => {
    ensureMyProfile = jest.fn().mockResolvedValue({ data: { ensureMyProfile: { id: user.userId } } });
    refetch = jest.fn().mockResolvedValue({});
    useMutation.mockReturnValue([ensureMyProfile]);
  });

  test('ensures and refetches only after the profile query is definitively empty', async () => {
    useQuery.mockReturnValue({
      loading: false,
      error: undefined,
      data: { profileByCognitoID: { items: [] } },
      refetch
    });

    const { result, rerender } = renderHook(() => useEnsureMyProfile(user, {}));

    expect(useQuery).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      variables: { cognitoID: user.userId }
    }));
    await waitFor(() => expect(ensureMyProfile).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));
    expect(result.current.initializationError).toBe(false);
    rerender();
    expect(ensureMyProfile).toHaveBeenCalledTimes(1);
  });

  test.each([
    { loading: true, error: undefined, data: undefined },
    { loading: false, error: new Error('query failed'), data: undefined },
    { loading: false, error: undefined, data: { profileByCognitoID: { items: [{ id: user.userId }] } } }
  ])('does not ensure while loading, on query failure, or when a profile exists', async queryResult => {
    useQuery.mockReturnValue({ ...queryResult, refetch });

    renderHook(() => useEnsureMyProfile(user, {}));

    await waitFor(() => expect(useQuery).toHaveBeenCalled());
    expect(ensureMyProfile).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
  });

  test('surfaces a generic initialization failure and retries successfully', async () => {
    ensureMyProfile
      .mockRejectedValueOnce(new Error('sensitive backend detail'))
      .mockResolvedValueOnce({ data: { ensureMyProfile: { id: user.userId } } });
    useQuery.mockReturnValue({
      loading: false,
      error: undefined,
      data: { profileByCognitoID: { items: [] } },
      refetch
    });

    const { result } = renderHook(() => useEnsureMyProfile(user, {}));

    await waitFor(() => expect(result.current.initializationError).toBe(true));
    expect(result.current).not.toHaveProperty('error');

    act(() => result.current.retryInitialization());

    await waitFor(() => expect(ensureMyProfile).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(refetch).toHaveBeenCalled());
    await waitFor(() => expect(result.current.initializationError).toBe(false));
  });
});
