import { act, renderHook, waitFor } from '@testing-library/react';
import { getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useAuthState } from './App';

jest.mock('aws-amplify', () => ({
  Amplify: { configure: jest.fn() }
}));

jest.mock('@aws-amplify/auth', () => ({
  getCurrentUser: jest.fn(),
  fetchAuthSession: jest.fn(),
  signOut: jest.fn()
}));

jest.mock('aws-amplify/utils', () => ({
  Hub: { listen: jest.fn() }
}));

describe('useAuthState', () => {
  let authEvent;
  let unsubscribe;

  beforeEach(() => {
    jest.clearAllMocks();
    unsubscribe = jest.fn();
    Hub.listen.mockImplementation((channel, listener) => {
      authEvent = listener;
      return unsubscribe;
    });
  });

  test('loads the current user and groups initially', async () => {
    const currentUser = { username: 'synthetic-user' };
    getCurrentUser.mockResolvedValue(currentUser);
    fetchAuthSession.mockResolvedValue({
      tokens: { idToken: { payload: { 'cognito:groups': ['BOARD'] } } }
    });

    const { result } = renderHook(() => useAuthState());

    await waitFor(() => expect(result.current.user).toBe(currentUser));
    expect(result.current.userGroups).toEqual(['BOARD']);
    expect(Hub.listen).toHaveBeenCalledWith('auth', expect.any(Function));
  });

  test('refreshes the user after a successful sign-in event', async () => {
    getCurrentUser.mockRejectedValueOnce(new Error('not signed in'));
    const { result } = renderHook(() => useAuthState());
    await waitFor(() => expect(getCurrentUser).toHaveBeenCalledTimes(1));

    const currentUser = { username: 'synthetic-user' };
    getCurrentUser.mockResolvedValue(currentUser);
    fetchAuthSession.mockResolvedValue({
      tokens: { idToken: { payload: { 'cognito:groups': ['MEDIA'] } } }
    });

    act(() => authEvent({ payload: { event: 'signedIn' } }));

    await waitFor(() => expect(result.current.user).toBe(currentUser));
    expect(result.current.userGroups).toEqual(['MEDIA']);
  });

  test('clears the user and groups after sign-out', async () => {
    getCurrentUser.mockResolvedValue({ username: 'synthetic-user' });
    fetchAuthSession.mockResolvedValue({
      tokens: { idToken: { payload: { 'cognito:groups': ['BOARD', 'MEDIA'] } } }
    });
    const { result } = renderHook(() => useAuthState());
    await waitFor(() => expect(result.current.user).not.toBeNull());

    act(() => authEvent({ payload: { event: 'signedOut' } }));

    expect(result.current.user).toBeNull();
    expect(result.current.userGroups).toEqual([]);
  });

  test('unsubscribes from Auth events on cleanup', () => {
    getCurrentUser.mockRejectedValue(new Error('not signed in'));
    const { unmount } = renderHook(() => useAuthState());

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
