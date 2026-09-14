import { fireEvent, render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import PaymentModal, { calculateProcessingFee, formatExpiration } from './PaymentModal';

test('charges one percent for cards and no fee for eCheck', () => {
  expect(calculateProcessingFee(100, 'card')).toBe(1);
  expect(calculateProcessingFee(100, 'bank_account')).toBe(0);
  expect(calculateProcessingFee(10.55, 'card')).toBe(0.11);
});

test('formats expiration digits as MM/YY', () => {
  expect(formatExpiration('1')).toBe('1');
  expect(formatExpiration('122')).toBe('12/2');
  expect(formatExpiration('12/27')).toBe('12/27');
  expect(formatExpiration('12ab278')).toBe('12/27');
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
  const expiration = screen.getByLabelText('Expiration');
  expect(expiration).toHaveAttribute('placeholder', 'MM/YY');
  fireEvent.change(expiration, { target: { value: '1227' } });
  expect(expiration).toHaveValue('12/27');
  expect(screen.queryByLabelText('Month')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Year')).not.toBeInTheDocument();
  expect(screen.queryByText(/cannot exceed the current balance/i)).not.toBeInTheDocument();
});
