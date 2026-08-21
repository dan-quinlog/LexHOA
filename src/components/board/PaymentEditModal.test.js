import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useLazyQuery, useMutation } from '@apollo/client';
import PaymentEditModal from './PaymentEditModal';
import { CREATE_PAYMENT, UPDATE_PAYMENT, UPDATE_PROFILE } from '../../queries/mutations';
import { GET_PROFILE } from '../../queries/queries';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: jest.fn(),
  useLazyQuery: jest.fn()
}));

test('attributes a manual payment to the selected profile owner', async () => {
  const createPayment = jest.fn().mockResolvedValue({ data: { createPayment: { id: 'payment-1' } } });
  const getProfile = jest.fn().mockResolvedValue({
    data: {
      getProfile: {
        id: 'owner-profile-id',
        cognitoID: 'owner-cognito-sub',
        balance: 300
      }
    }
  });
  const onClose = jest.fn();
  useLazyQuery.mockImplementation(query => {
    expect(query).toBe(GET_PROFILE);
    return [getProfile];
  });
  useMutation.mockImplementation(mutation => {
    if (mutation === CREATE_PAYMENT) return [createPayment];
    if (mutation === UPDATE_PAYMENT || mutation === UPDATE_PROFILE) return [jest.fn()];
    throw new Error('Unexpected mutation');
  });

  const { container } = render(
    <PaymentEditModal payment={null} onClose={onClose} show />
  );
  const inputs = container.querySelectorAll('input');
  fireEvent.change(inputs[0], { target: { value: 'synthetic-check' } });
  fireEvent.change(inputs[1], { target: { value: '2026-08-21' } });
  fireEvent.change(inputs[2], { target: { value: '100' } });
  fireEvent.change(inputs[3], { target: { value: 'synthetic-invoice' } });
  fireEvent.change(inputs[4], { target: { value: '100' } });
  fireEvent.change(inputs[5], { target: { value: 'owner-profile-id' } });

  fireEvent.click(screen.getByRole('button', { name: 'Create' }));

  await waitFor(() => expect(createPayment).toHaveBeenCalledTimes(1));
  expect(getProfile).toHaveBeenCalledWith({
    variables: { id: 'owner-profile-id' },
    fetchPolicy: 'network-only'
  });
  expect(getProfile.mock.invocationCallOrder[0]).toBeLessThan(createPayment.mock.invocationCallOrder[0]);
  expect(createPayment).toHaveBeenCalledWith({
    variables: {
      input: expect.objectContaining({
        ownerPaymentsId: 'owner-profile-id',
        owner: 'owner-cognito-sub'
      })
    }
  });
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});

test('shows an error and does not create when the owner cannot be resolved', async () => {
  const createPayment = jest.fn();
  const getProfile = jest.fn().mockResolvedValue({ data: { getProfile: null } });
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  useLazyQuery.mockReturnValue([getProfile]);
  useMutation.mockImplementation(mutation => {
    if (mutation === CREATE_PAYMENT) return [createPayment];
    return [jest.fn()];
  });

  const { container } = render(
    <PaymentEditModal payment={null} onClose={jest.fn()} show />
  );
  const inputs = container.querySelectorAll('input');
  fireEvent.change(inputs[0], { target: { value: 'synthetic-check' } });
  fireEvent.change(inputs[1], { target: { value: '2026-08-21' } });
  fireEvent.change(inputs[2], { target: { value: '100' } });
  fireEvent.change(inputs[3], { target: { value: 'synthetic-invoice' } });
  fireEvent.change(inputs[4], { target: { value: '100' } });
  fireEvent.change(inputs[5], { target: { value: 'owner-profile-id' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to save payment. Verify the Owner ID and try again.'
  );
  expect(createPayment).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  consoleError.mockRestore();
});
