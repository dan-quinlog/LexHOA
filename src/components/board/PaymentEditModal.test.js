import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useMutation } from '@apollo/client';
import PaymentEditModal from './PaymentEditModal';
import { RECORD_MANUAL_PAYMENT, UPDATE_PAYMENT } from '../../queries/mutations';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: jest.fn()
}));

const fillCreateForm = (container, ownerId) => {
  const inputs = container.querySelectorAll('input');
  fireEvent.change(inputs[0], { target: { value: 'synthetic-check' } });
  fireEvent.change(inputs[1], { target: { value: '2026-08-21' } });
  fireEvent.change(inputs[2], { target: { value: '100.25' } });
  fireEvent.change(inputs[3], { target: { value: 'synthetic-invoice' } });
  fireEvent.change(inputs[4], { target: { value: '100' } });
  fireEvent.change(inputs[5], { target: { value: ownerId } });
  return inputs;
};

test('records a new payment and its balance change through one server mutation', async () => {
  const recordManualPayment = jest.fn().mockResolvedValue({ data: { recordManualPayment: { id: 'payment-1' } } });
  const updatePayment = jest.fn();
  const onClose = jest.fn();
  useMutation.mockImplementation(mutation => {
    if (mutation === RECORD_MANUAL_PAYMENT) return [recordManualPayment];
    if (mutation === UPDATE_PAYMENT) return [updatePayment];
    throw new Error('Unexpected mutation');
  });

  const { container } = render(<PaymentEditModal payment={null} onClose={onClose} show />);
  const inputs = fillCreateForm(container, ' owner-profile-id ');
  fireEvent.click(inputs[6]);
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));

  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(recordManualPayment).toHaveBeenCalledWith({
    variables: {
      input: {
        ownerPaymentsId: 'owner-profile-id',
        checkDate: '2026-08-21',
        checkNumber: 'synthetic-check',
        checkAmount: 100.25,
        invoiceNumber: 'synthetic-invoice',
        invoiceAmount: 100,
        applyToBalance: true
      }
    }
  });
  expect(updatePayment).not.toHaveBeenCalled();
});

test('shows the server reason and stays open when the payment is rejected', async () => {
  const recordManualPayment = jest.fn().mockRejectedValue({
    graphQLErrors: [{ message: 'Owner profile not found' }]
  });
  const onClose = jest.fn();
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  useMutation.mockImplementation(mutation =>
    mutation === RECORD_MANUAL_PAYMENT ? [recordManualPayment] : [jest.fn()]);

  const { container } = render(<PaymentEditModal payment={null} onClose={onClose} show />);
  fillCreateForm(container, 'missing-profile');
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Owner profile not found');
  expect(recordManualPayment.mock.calls[0][0].variables.input.applyToBalance).toBe(false);
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  consoleError.mockRestore();
});
