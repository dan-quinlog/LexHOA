import { fireEvent, render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import PaymentModal, { calculateProcessingFee, formatExpiration } from './PaymentModal';
import { CREATE_AUTHNET_TRANSACTION } from '../../queries/mutations';

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

test('retries a declined card payment as a new payment attempt', async () => {
  document.head.appendChild(Object.assign(document.createElement('script'), { src: 'https://jstest.authorize.net/v1/Accept.js' }));
  window.Accept = { dispatchData: (_, respond) => respond({ messages: { resultCode: 'Ok' }, opaqueData: { dataDescriptor: 'COMMON.ACCEPT.INAPP.PAYMENT', dataValue: 'synthetic-token' } }) };
  const randomUUID = jest.fn().mockReturnValueOnce('first-attempt').mockReturnValueOnce('second-attempt');
  Object.defineProperty(global, 'crypto', { value: { randomUUID }, configurable: true });
  const variables = idempotencyKey => ({ profileId: 'synthetic-profile', idempotencyKey, expectedAmount: 100, paymentMethodType: 'card', opaqueDataDescriptor: 'COMMON.ACCEPT.INAPP.PAYMENT', opaqueDataValue: 'synthetic-token' });
  const mocks = [
    { request: { query: CREATE_AUTHNET_TRANSACTION, variables: variables('first-attempt') }, result: { errors: [new GraphQLError('Payment processor declined: 2: This transaction has been declined.')] } },
    { request: { query: CREATE_AUTHNET_TRANSACTION, variables: variables('second-attempt') }, result: { data: { createAuthNetTransaction: { paymentId: 'payment', transactionId: 'synthetic-transaction', status: 'SUCCEEDED', settlementPending: false, amount: 100, processingFee: 1, totalAmount: 101, paymentMethodType: 'card', responseCode: null, messageCode: null, messageText: null } } } }
  ];
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <PaymentModal isOpen onClose={jest.fn()} profileId="synthetic-profile" balance={100} onPaymentSuccess={jest.fn()} />
    </MockedProvider>
  );

  fireEvent.click(screen.getByRole('button', { name: /1 Month/ }));
  fireEvent.click(screen.getByRole('button', { name: /Credit\/Debit Card/ }));
  fireEvent.change(screen.getByPlaceholderText('4111 1111 1111 1111'), { target: { value: '4111111111111111' } });
  fireEvent.change(screen.getByLabelText('Expiration'), { target: { value: '1230' } });
  fireEvent.change(screen.getByPlaceholderText('123'), { target: { value: '123' } });
  const pay = screen.getByRole('button', { name: 'Pay $101.00' });

  fireEvent.click(pay);
  expect(await screen.findByText(/This transaction has been declined/)).toBeInTheDocument();
  fireEvent.click(pay);
  expect(await screen.findByText('Payment Successful!')).toBeInTheDocument();
  expect(randomUUID).toHaveBeenCalledTimes(2);
});
