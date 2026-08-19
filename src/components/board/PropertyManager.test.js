import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useLazyQuery, useMutation } from '@apollo/client';

process.env.REACT_APP_BOARD_GROUP_NAME = 'BOARD';
process.env.REACT_APP_PRESIDENT_GROUP_NAME = 'PRESIDENT';

jest.mock('@apollo/client', () => ({
  gql: value => value,
  useLazyQuery: jest.fn(),
  useMutation: jest.fn()
}));

const PropertyManager = require('./PropertyManager').default;
const {
  CREATE_PROPERTY,
  DELETE_PROPERTY,
  UPDATE_PROFILE,
  UPDATE_PROPERTY
} = require('../../queries/mutations');

const property = {
  id: 'synthetic-property',
  address: '1 Synthetic Way',
  profOwnerId: 'owner-profile',
  profTenantId: null,
  type: 'PROPERTY'
};

function renderManager(groups, updateProperty = jest.fn().mockResolvedValue({})) {
  const deleteProperty = jest.fn();
  const createProperty = jest.fn();
  const updateProfile = jest.fn().mockResolvedValue({});
  useLazyQuery.mockReturnValue([jest.fn()]);
  useMutation.mockImplementation(mutation => {
    if (mutation === DELETE_PROPERTY) return [deleteProperty];
    if (mutation === UPDATE_PROPERTY) return [updateProperty];
    if (mutation === CREATE_PROPERTY) return [createProperty];
    if (mutation === UPDATE_PROFILE) return [updateProfile];
    throw new Error('Unexpected mutation in test');
  });

  render(
    <PropertyManager
      searchState={{ searchType: 'propertyId', searchTerm: '', searchResults: [property] }}
      setSearchState={jest.fn()}
      userGroups={groups}
    />
  );
  return { updateProperty };
}

describe('PropertyManager edits', () => {
  beforeEach(() => jest.clearAllMocks());

  test('update response does not resolve optional profile relationships', () => {
    const operation = UPDATE_PROPERTY.join('');

    expect(operation).not.toMatch(/profOwner\s*\{/);
    expect(operation).not.toMatch(/profTenant\s*\{/);
  });

  test('BOARD updates relationships without owner and cannot edit the address', async () => {
    const { updateProperty } = renderManager(['BOARD']);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByDisplayValue('1 Synthetic Way')).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create New' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('owner-profile'), { target: { value: 'new-owner-profile' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updateProperty).toHaveBeenCalledTimes(1));
    const input = updateProperty.mock.calls[0][0].variables.input;
    expect(input.profOwnerId).toBe('new-owner-profile');
    expect(input).not.toHaveProperty('owner');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument());
  });

  test('PRESIDENT can edit the address when also granted BOARD access', () => {
    renderManager(['BOARD', 'PRESIDENT']);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByDisplayValue('1 Synthetic Way')).not.toHaveAttribute('readonly');
  });

  test('shows a generic error and keeps the modal open when save fails', async () => {
    const marker = 'sensitive mutation marker';
    renderManager(['BOARD'], jest.fn().mockRejectedValue(new Error(marker)));
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save property. Please try again.');
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.queryByText(marker)).not.toBeInTheDocument();
  });
});
