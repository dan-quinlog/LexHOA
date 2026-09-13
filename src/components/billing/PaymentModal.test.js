import { fireEvent, render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import PaymentModal, { calculateProcessingFee } from './PaymentModal';

test('charges one percent for cards and no fee for eCheck', () => {
  expect(calculateProcessingFee(100, 'card')).toBe(1);
  expect(calculateProcessingFee(100, 'bank_account')).toBe(0);
  expect(calculateProcessingFee(10.55, 'card')).toBe(0.11);
});

test('allows an advance payment when the current balance is zero', () => {
  render(
    <MockedProvider>
      <PaymentModal
        isOpen
        onClose={jest.fn()}
        profileId="synthetic-profile"
        balance={0}
        onPaymentSuccess={jest.fn()}
      />
    </MockedProvider>
  );

  fireEvent.click(screen.getByRole('button', { name: /1 Month/ }));
  fireEvent.click(screen.getByRole('button', { name: /Credit\/Debit Card/ }));

  expect(screen.getByText('Card Details')).toBeInTheDocument();
  expect(screen.queryByText(/cannot exceed the current balance/i)).not.toBeInTheDocument();
});
