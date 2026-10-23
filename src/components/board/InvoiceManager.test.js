import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useApolloClient, useMutation } from '@apollo/client';
import { BOARD_INVOICES_BY_OWNER, GET_PROFILE, RECENT_INVOICES } from '../../queries/queries';
import { ISSUE_INVOICE, VOID_INVOICE } from '../../queries/mutations';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: jest.fn(),
  useMutation: jest.fn()
}));

process.env.REACT_APP_TREASURER_GROUP_NAME = 'TREASURER';
process.env.REACT_APP_PRESIDENT_GROUP_NAME = 'PRESIDENT';
const InvoiceManager = require('./InvoiceManager').default;

const invoice = overrides => ({
  id: 'invoice-1',
  invoiceNumber: 'INV-000042',
  type: 'ASSESSMENT',
  status: 'ISSUED',
  billingPeriod: '2027',
  lineItems: [{ propertyId: 'property-1', address: '101 Main St', description: 'Roof', amount: 150.1 }],
  totalAmount: 150.1,
  balanceApplied: true,
  dateApplied: '2026-10-23',
  dateDue: '2026-12-31',
  description: null,
  createdBy: 'treasurer@example.invalid',
  ownerInvoices: { id: 'owner-1', name: 'Pat Owner' },
  ownerInvoicesId: 'owner-1',
  ...overrides
});

function setup({ queries, issueInvoice = jest.fn(), voidInvoice = jest.fn() }) {
  const query = jest.fn(({ query: document }) => Promise.resolve({ data: queries.get(document)() }));
  useApolloClient.mockReturnValue({ query });
  useMutation.mockImplementation(mutation => {
    if (mutation === ISSUE_INVOICE) return [issueInvoice];
    if (mutation === VOID_INVOICE) return [voidInvoice];
    throw new Error('Unexpected mutation');
  });
  return query;
}

test('the treasurer creates an invoice for an owner property and then sees that owner\'s invoices', async () => {
  const issueInvoice = jest.fn().mockResolvedValue({
    data: { issueInvoice: { id: 'invoice-1', invoiceNumber: 'INV-000042', totalAmount: 150.1, ownerInvoicesId: 'owner-1' } }
  });
  const query = setup({
    issueInvoice,
    queries: new Map([
      [GET_PROFILE, () => ({ getProfile: { id: 'owner-1', name: 'Pat Owner', ownedProperties: { items: [{ id: 'property-1', address: '101 Main St' }] } } })],
      [BOARD_INVOICES_BY_OWNER, () => ({ invoicesByOwner: { items: [invoice()] } })]
    ])
  });
  render(<InvoiceManager userGroups={['BOARD', 'TREASURER']} />);

  fireEvent.click(screen.getByRole('button', { name: 'Create Invoice' }));
  const dialog = screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('Owner ID*'), { target: { value: ' owner-1 ' } });
  fireEvent.blur(within(dialog).getByLabelText('Owner ID*'));
  expect(await within(dialog).findByText('Owner: Pat Owner')).toBeInTheDocument();

  fireEvent.change(within(dialog).getByLabelText('Due Date*'), { target: { value: '2026-12-31' } });
  fireEvent.change(within(dialog).getByLabelText('Line 1 property'), { target: { value: 'property-1' } });
  fireEvent.change(within(dialog).getByLabelText('Line 1 description'), { target: { value: 'Roof' } });
  fireEvent.change(within(dialog).getByLabelText('Line 1 amount'), { target: { value: '100.05' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Add Line' }));
  fireEvent.change(within(dialog).getByLabelText('Line 2 amount'), { target: { value: '50.05' } });
  expect(within(dialog).getByText('Total: $150.10')).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('checkbox'));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Create Invoice' }));

  await waitFor(() => expect(issueInvoice).toHaveBeenCalledTimes(1));
  expect(issueInvoice.mock.calls[0][0].variables.input).toEqual({
    ownerInvoicesId: 'owner-1',
    type: 'ASSESSMENT',
    billingPeriod: null,
    dateApplied: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    dateDue: '2026-12-31',
    description: null,
    balanceApplied: false,
    lineItems: [
      { propertyId: 'property-1', description: 'Roof', amount: 100.05 },
      { propertyId: null, description: null, amount: 50.05 }
    ]
  });
  expect(await screen.findByRole('status')).toHaveTextContent('Created INV-000042 for $150.10.');
  expect(query).toHaveBeenLastCalledWith(expect.objectContaining({
    query: BOARD_INVOICES_BY_OWNER,
    variables: { ownerInvoicesId: 'owner-1', sortDirection: 'DESC' }
  }));
  expect(await screen.findByText('Created By: treasurer@example.invalid')).toBeInTheDocument();
});

test('voiding asks for a reason and refreshes the results', async () => {
  let current = invoice();
  const voidInvoice = jest.fn().mockImplementation(async () => {
    current = invoice({ status: 'VOID', voidedBy: 'president@example.invalid', voidedAt: '2026-10-24T01:00:00.000Z', voidReason: 'Billed twice' });
    return { data: {} };
  });
  setup({ voidInvoice, queries: new Map([[RECENT_INVOICES, () => ({ invoicesByTypeDateApplied: { items: [current] } })]]) });
  render(<InvoiceManager userGroups={['PRESIDENT']} />);

  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Void' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText('$150.10 will be reversed on the owner\'s balance.')).toBeInTheDocument();
  const confirm = within(dialog).getByRole('button', { name: 'Void' });
  expect(confirm).toBeDisabled();
  fireEvent.change(within(dialog).getByLabelText('Reason for voiding'), { target: { value: ' Billed twice ' } });
  fireEvent.click(confirm);

  await waitFor(() => expect(voidInvoice).toHaveBeenCalledWith({
    variables: { input: { id: 'invoice-1', reason: 'Billed twice' } }
  }));
  expect(await screen.findByText('Voided 2026-10-24 by president@example.invalid: Billed twice')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Void' })).not.toBeInTheDocument();
});

test('board members without the Treasurer or President role can search but not create or void', async () => {
  setup({ queries: new Map([[RECENT_INVOICES, () => ({ invoicesByTypeDateApplied: { items: [invoice()] } })]]) });
  render(<InvoiceManager userGroups={['BOARD']} />);

  expect(screen.queryByRole('button', { name: 'Create Invoice' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  expect(await screen.findByText('INV-000042')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Void' })).not.toBeInTheDocument();
});
