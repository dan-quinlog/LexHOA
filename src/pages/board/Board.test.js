import { fireEvent, render, screen } from '@testing-library/react';
import { useApolloClient, useMutation } from '@apollo/client';
import { BOARD_INVOICES_BY_NUMBER, PROFILE_BALANCES } from '../../queries/queries';

// ReportManager reads group names when it loads.
process.env.REACT_APP_BOARD_GROUP_NAME = 'BOARD';
const Board = require('./Board').default;

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: jest.fn(),
  useMutation: jest.fn()
}));

jest.mock('../../components/board/BulletinManager', () => () => <div>Bulletin manager</div>);
jest.mock('../../components/board/PersonManager', () => () => null);
jest.mock('../../components/board/PropertyManager', () => () => null);
jest.mock('../../components/board/PaymentManager', () => () => null);
jest.mock('../../components/board/PingManager', () => () => null);
jest.mock('../../components/board/BoardRoleManager', () => () => null);
jest.mock('../../components/board/DocumentManager', () => () => null);

test('closes the mobile tool menu with Escape and an outside click', () => {
  render(<Board />);

  const trigger = screen.getAllByRole('button', { name: 'Bulletins' })
    .find(button => button.hasAttribute('aria-controls'));
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(trigger);
  fireEvent.mouseDown(document.body);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('keeps invoice searches and report results when switching tools', async () => {
  const responses = new Map([
    [BOARD_INVOICES_BY_NUMBER, { invoicesByInvoiceNumber: { items: [{
      id: 'invoice-1', invoiceNumber: 'INV-000042', type: 'DUES', status: 'ISSUED', lineItems: [],
      totalAmount: 1000, balanceApplied: true, dateApplied: '2026-11-01', dateDue: '2027-12-31', ownerInvoicesId: 'owner-1'
    }] } }],
    [PROFILE_BALANCES, { listProfiles: { items: [{ id: 'owner-1', name: 'Pat Owner', email: 'pat@example.invalid', balance: 250 }], nextToken: null } }]
  ]);
  const query = jest.fn(async ({ query: document }) => ({ data: responses.get(document) }));
  useApolloClient.mockReturnValue({ query });
  useMutation.mockReturnValue([jest.fn()]);
  const openTool = label => fireEvent.click(screen.getAllByRole('button', { name: label })
    .find(button => !button.hasAttribute('aria-controls')));
  render(<Board userGroups={['BOARD']} />);

  openTool('Invoices');
  fireEvent.change(screen.getByRole('combobox', { name: 'Search invoices by' }), { target: { value: 'invoiceNumber' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Search term' }), { target: { value: 'INV-000042' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  expect(await screen.findByRole('heading', { name: 'INV-000042' })).toBeInTheDocument();

  openTool('Bulletins');
  expect(screen.queryByRole('heading', { name: 'INV-000042' })).not.toBeInTheDocument();
  openTool('Invoices');

  expect(screen.getByRole('combobox', { name: 'Search invoices by' })).toHaveValue('invoiceNumber');
  expect(screen.getByRole('textbox', { name: 'Search term' })).toHaveValue('INV-000042');
  expect(screen.getByRole('heading', { name: 'INV-000042' })).toBeInTheDocument();

  openTool('Reports');
  fireEvent.click(screen.getByRole('button', { name: 'Run Report' }));
  expect(await screen.findByRole('cell', { name: '$250.00' })).toBeInTheDocument();
  openTool('Invoices');
  openTool('Reports');
  expect(screen.getByRole('cell', { name: '$250.00' })).toBeInTheDocument();

  // Both tools redisplayed their saved results without querying again.
  expect(query).toHaveBeenCalledTimes(2);
});
