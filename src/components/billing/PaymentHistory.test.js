import { render, screen } from '@testing-library/react';
import PaymentHistory from './PaymentHistory';

test('lists invoices inline with payments, newest first, by billing date', () => {
  const payments = [
    {
      id: 'check',
      paymentMethod: 'CHECK',
      checkNumber: '1042',
      checkDate: '2025-12-01',
      createdAt: '2026-10-20T16:00:00.000Z',
      amount: 1000,
      totalAmount: 1000,
      status: 'SUCCEEDED'
    },
    {
      id: 'card',
      paymentMethod: 'CARD',
      createdAt: '2026-11-20T15:00:00.000Z',
      amount: 1000,
      processingFee: 30,
      totalAmount: 1030,
      status: 'SUCCEEDED'
    }
  ];
  const invoices = [
    {
      id: 'dues-2026-owner',
      invoiceNumber: 'INV-000001',
      type: 'DUES',
      status: 'ISSUED',
      dateApplied: '2025-11-01',
      dateDue: '2026-12-31',
      totalAmount: 1000,
      balanceApplied: false,
      description: '2026 annual HOA dues',
      lineItems: [{ propertyId: 'p1', address: '100 Elm St', amount: 1000 }]
    },
    {
      id: 'dues-2027-owner',
      invoiceNumber: 'INV-000002',
      type: 'DUES',
      status: 'ISSUED',
      dateApplied: '2026-11-01',
      dateDue: '2027-12-31',
      totalAmount: 2000,
      balanceApplied: true,
      description: '2027 annual HOA dues',
      lineItems: [
        { propertyId: 'p1', address: '100 Elm St', amount: 1000 },
        { propertyId: 'p2', address: '200 Pine St', amount: 1000 }
      ]
    }
  ];

  const { container } = render(<PaymentHistory payments={payments} invoices={invoices} />);

  const dates = [...container.querySelectorAll('.payment-date')].map((node) => node.textContent);
  expect(dates).toEqual(['Nov 20, 2026', 'Nov 1, 2026', 'Dec 1, 2025', 'Nov 1, 2025']);

  expect(screen.getByText('Invoice INV-000002 · Due Dec 31, 2027')).toBeInTheDocument();
  expect(screen.getByText('Invoice INV-000001 · Due Dec 31, 2026 · Not applied to balance')).toBeInTheDocument();
  expect(screen.getByText('200 Pine St')).toBeInTheDocument();
  expect(screen.getByText('$2,000.00')).toBeInTheDocument();
});
