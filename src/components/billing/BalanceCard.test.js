import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BalanceCard from './BalanceCard';

test('displays a credit as a positive amount with an explicit label', () => {
  render(
    <MemoryRouter>
      <BalanceCard balance={-125} />
    </MemoryRouter>
  );

  expect(screen.getByText('$125.00')).toBeInTheDocument();
  expect(screen.getByText('Account Credit')).toBeInTheDocument();
  expect(screen.queryByText('-$125.00')).not.toBeInTheDocument();
});
