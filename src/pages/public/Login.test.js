import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { signInWithRedirect } from '@aws-amplify/auth';
import Login from './Login';

jest.mock('@aws-amplify/auth', () => ({
  signInWithRedirect: jest.fn()
}));

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('starts redirect sign-in without logging configuration', async () => {
    signInWithRedirect.mockResolvedValue(undefined);
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(signInWithRedirect).toHaveBeenCalledTimes(1));
    expect(consoleLog).not.toHaveBeenCalled();
    consoleLog.mockRestore();
  });

  test('shows a generic error when redirect sign-in cannot start', async () => {
    signInWithRedirect.mockRejectedValue(new Error('provider detail'));
    render(<Login />);

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to start sign in. Please try again.');
  });
});
