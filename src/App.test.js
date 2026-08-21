import { act, renderHook, waitFor } from '@testing-library/react';
import { Amplify } from 'aws-amplify';
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
    Amplify.configure.mockImplementation(() => {});
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

  test('keeps a valid current user when group session lookup fails', async () => {
    const currentUser = { username: 'synthetic-user' };
    getCurrentUser.mockResolvedValue(currentUser);
    fetchAuthSession.mockRejectedValue(new Error('session unavailable'));

    const { result } = renderHook(() => useAuthState());

    await waitFor(() => expect(result.current.user).toBe(currentUser));
    expect(fetchAuthSession).toHaveBeenCalledTimes(1);
    expect(result.current.userGroups).toEqual([]);
  });

  test('installs the listener before configure and handles callback completion during configure', async () => {
    const currentUser = { username: 'synthetic-user' };
    getCurrentUser.mockResolvedValue(currentUser);
    fetchAuthSession.mockResolvedValue({ tokens: { idToken: { payload: {} } } });
    Amplify.configure.mockImplementation(() => {
      authEvent({ payload: { event: 'signInWithRedirect' } });
    });

    const { result } = renderHook(() => useAuthState());

    await waitFor(() => expect(result.current.user).toBe(currentUser));
    expect(Hub.listen.mock.invocationCallOrder[0]).toBeLessThan(
      Amplify.configure.mock.invocationCallOrder[0]
    );
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
  });

  test.each(['signInWithRedirect', 'signedIn'])(
    'refreshes the user after the %s event',
    async (event) => {
      getCurrentUser.mockRejectedValueOnce(new Error('not signed in'));
      const { result } = renderHook(() => useAuthState());
      await waitFor(() => expect(getCurrentUser).toHaveBeenCalledTimes(1));

      const currentUser = { username: 'synthetic-user' };
      getCurrentUser.mockResolvedValue(currentUser);
      fetchAuthSession.mockResolvedValue({
        tokens: { idToken: { payload: { 'cognito:groups': ['MEDIA'] } } }
      });

      act(() => authEvent({ payload: { event } }));

      await waitFor(() => expect(result.current.user).toBe(currentUser));
      expect(result.current.userGroups).toEqual(['MEDIA']);
    }
  );

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

  test('does not depend on generated Amplify configuration', () => {
    const source = require('fs').readFileSync(require.resolve('./App'), 'utf8');
    expect(source).not.toContain('amplifyconfiguration');
  });

  test('shows Documents but not Billing in authenticated menu items', () => {
    const source = require('fs').readFileSync(require.resolve('./App'), 'utf8');
    const authenticatedMenu = source.match(/const renderMenuItems = \(\) => \{([\s\S]*?)const cognitoId/)[1];
    expect(authenticatedMenu).toContain("{ label: 'Documents', path: '/documents' }");
    expect(authenticatedMenu).not.toContain("{ label: 'Billing', path: '/billing' }");
  });
});
