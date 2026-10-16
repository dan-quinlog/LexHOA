import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

process.env.REACT_APP_BOARD_GROUP_NAME = 'BOARD';

const ReportManager = require('./ReportManager').default;
const { PROFILE_BALANCES } = require('../../queries/queries');

const page = (nextToken, items, next) => ({
  request: { query: PROFILE_BALANCES, variables: { limit: 1000, nextToken } },
  result: { data: { listProfiles: { items, nextToken: next } } }
});

test('board members run the profile balance report across pages, sorted by balance owed', async () => {
  const writeText = jest.fn().mockResolvedValue();
  Object.assign(navigator, { clipboard: { writeText } });
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
  const mocks = [
    page(null, [
      { id: 'credit', name: 'Credit Owner', email: 'credit@example.com', balance: -50 },
      { id: 'small', name: 'Small Owner', email: 'small@example.com', balance: 25.5 }
    ], 'page-2'),
    page('page-2', [
      { id: 'none', name: 'Unbilled Owner', email: 'none@example.com', balance: null },
      { id: 'large', name: 'Large Owner', email: 'large@example.com', balance: 1200 }
    ], null)
  ];
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ReportManager userGroups={['BOARD']} />
    </MockedProvider>
  );

  expect(screen.getByRole('combobox', { name: 'Report' })).toHaveDisplayValue('Profile Balances');
  fireEvent.click(screen.getByRole('button', { name: 'Run Report' }));

  const table = await screen.findByRole('table');
  expect(within(table).getAllByRole('columnheader').map(h => h.textContent)).toEqual(['Owner Name', 'Email', 'Balance']);
  const rows = within(table).getAllByRole('row').slice(1).map(row =>
    within(row).getAllByRole('cell').map(cell => cell.textContent));
  expect(rows).toEqual([
    ['Large OwnerCopy ID', 'large@example.com', '$1,200.00'],
    ['Small OwnerCopy ID', 'small@example.com', '$25.50'],
    ['Unbilled OwnerCopy ID', 'none@example.com', '$0.00'],
    ['Credit OwnerCopy ID', 'credit@example.com', '-$50.00']
  ]);

  fireEvent.click(within(within(table).getAllByRole('row')[2]).getByRole('button', { name: 'Copy ID' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('small'));
});

test('reports are only offered to the groups allowed to run them', () => {
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <ReportManager userGroups={['MEDIA']} />
    </MockedProvider>
  );

  expect(screen.queryByRole('combobox', { name: 'Report' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Run Report' })).not.toBeInTheDocument();
  expect(screen.getByText("You don't have access to any reports.")).toBeInTheDocument();
});
