import { getEffectiveBalance } from './payments';

test('preserves advance-payment credits in the displayed balance', () => {
  expect(getEffectiveBalance(0, 100)).toBe(-100);
  expect(getEffectiveBalance(25, 100)).toBe(-75);
});
