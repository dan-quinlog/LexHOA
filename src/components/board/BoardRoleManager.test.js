import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useLazyQuery, useMutation } from '@apollo/client';
import BoardRoleManager from './BoardRoleManager';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useLazyQuery: jest.fn(),
  useMutation: jest.fn()
}));
jest.mock('./shared/BoardCard', () => () => null);
jest.mock('../modals/NotificationModal', () => ({ message }) => <div>{message}</div>);

let mutationOptions;
const listUsers = jest.fn();
const manageGroups = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useLazyQuery.mockReturnValue([listUsers, { loading: false, data: undefined }]);
  useMutation.mockImplementation((mutation, options) => {
    mutationOptions = options;
    return [manageGroups, { loading: false }];
  });
});

function submitAdd() {
  render(<BoardRoleManager userGroups={['PRESIDENT']} />);
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'ADD' } });
  fireEvent.change(screen.getByPlaceholderText('Enter Login ID'), {
    target: { value: 'synthetic-target' }
  });
  fireEvent.click(screen.getByRole('button', { name: 'Run' }));
}

test('preserves the target and displays a Lambda-declared failure', () => {
  submitAdd();
  act(() => {
    mutationOptions.onCompleted({
      manageCognitoGroups: { success: false, message: 'Unable to verify your permissions' }
    });
  });

  expect(screen.getByText('Unable to verify your permissions')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Enter Login ID')).toHaveValue('synthetic-target');
  expect(listUsers).not.toHaveBeenCalled();
});

test('clears the target and refreshes the selected group only after success', () => {
  submitAdd();
  act(() => {
    mutationOptions.onCompleted({
      manageCognitoGroups: { success: true, message: 'Role updated' }
    });
  });

  expect(screen.getByText('Role updated')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Enter Login ID')).toHaveValue('');
  expect(listUsers).toHaveBeenCalledWith({ variables: { groupName: 'BOARD' } });
});
