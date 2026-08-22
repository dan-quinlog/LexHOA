import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useLazyQuery, useMutation } from '@apollo/client';
import PingManager from './PingManager';
import { LIST_PENDING_PINGS, SEARCH_PINGS_BY_CREATOR, SEARCH_PINGS_BY_ID } from '../../queries/queries';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useLazyQuery: jest.fn(),
  useMutation: jest.fn()
}));

const ping = {
  id: 'ping-1',
  type: 'PropertyRequest',
  items: null,
  instruction: 'Synthetic request',
  status: 'PENDING',
  profCreatorId: 'profile-1',
  createdAt: '2026-08-22T00:00:00.000Z'
};

function Harness({ searchType }) {
  const [searchState, setSearchState] = useState({ searchType, searchTerm: 'search-value', searchResults: [] });
  return <PingManager searchState={searchState} setSearchState={setSearchState} />;
}

const findRequest = () => screen.findByText((_, element) =>
  element.tagName === 'DIV' && element.textContent === 'Request Details: Synthetic request'
);

beforeEach(() => {
  jest.clearAllMocks();
  useMutation.mockReturnValue([jest.fn()]);
});

test('uses the getPing response for Ping ID search', async () => {
  const searchById = jest.fn().mockResolvedValue({ data: { getPing: ping } });
  useLazyQuery.mockImplementation(query => [query === SEARCH_PINGS_BY_ID ? searchById : jest.fn()]);
  render(<Harness searchType="id" />);

  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  expect(await findRequest()).toBeInTheDocument();
  expect(searchById).toHaveBeenCalledWith({ variables: { id: 'search-value' } });
});

test('uses the pingsByCreator response for Creator ID search', async () => {
  const searchByCreator = jest.fn().mockResolvedValue({ data: { pingsByCreator: { items: [ping] } } });
  useLazyQuery.mockImplementation(query => [query === SEARCH_PINGS_BY_CREATOR ? searchByCreator : jest.fn()]);
  render(<Harness searchType="creator" />);

  fireEvent.click(screen.getByRole('button', { name: 'Search' }));

  expect(await findRequest()).toBeInTheDocument();
  expect(searchByCreator).toHaveBeenCalledWith({ variables: { profCreatorId: 'search-value' } });
});

test('uses the listPings response for pending search', async () => {
  const listPending = jest.fn().mockResolvedValue({ data: { listPings: { items: [ping] } } });
  useLazyQuery.mockImplementation(query => [query === LIST_PENDING_PINGS ? listPending : jest.fn()]);
  render(<Harness searchType="id" />);

  fireEvent.click(screen.getByRole('button', { name: 'View Pending' }));

  expect(await findRequest()).toBeInTheDocument();
  expect(listPending).toHaveBeenCalledTimes(1);
});
