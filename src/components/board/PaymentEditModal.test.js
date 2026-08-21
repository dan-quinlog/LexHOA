import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useMutation, useQuery } from '@apollo/client';
import PaymentEditModal from './PaymentEditModal';
import { CREATE_PAYMENT, UPDATE_PAYMENT, UPDATE_PROFILE } from '../../queries/mutations';
import { GET_PROFILE } from '../../queries/queries';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: jest.fn(),
  useQuery: jest.fn()
}));

test('attributes a manual payment to the selected profile owner', async () => {
  const createPayment = jest.fn().mockResolvedValue({ data: { createPayment: { id: 'payment-1' } } });
  const onClose = jest.fn();
  useMutation.mockImplementation(mutation => {
    if (mutation === CREATE_PAYMENT) return [createPayment];
    if (mutation === UPDATE_PAYMENT || mutation === UPDATE_PROFILE) return [jest.fn()];
    throw new Error('Unexpected mutation');
  });
  useQuery.mockImplementation((query, options) => {
    expect(query).toBe(GET_PROFILE);
    return {
      data: options.skip ? undefined : {
        getProfile: {
          id: options.variables.id,
          cognitoID: 'owner-cognito-sub',
          balance: 300
        }
      }
    };
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
