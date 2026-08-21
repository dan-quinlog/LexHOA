import { calculateProcessingFee } from './PaymentModal';

test('charges one percent for cards and no fee for eCheck', () => {
  expect(calculateProcessingFee(100, 'card')).toBe(1);
  expect(calculateProcessingFee(100, 'bank_account')).toBe(0);
  expect(calculateProcessingFee(10.55, 'card')).toBe(0.11);
});
