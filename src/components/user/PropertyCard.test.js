import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useMutation, useQuery } from '@apollo/client';
import PropertyCard from './PropertyCard';
import { ADD_TENANT_TO_MY_PROPERTY, UPDATE_PROFILE } from '../../queries/mutations';
import { GET_TENANT_PROFILE } from '../../queries/queries';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: jest.fn(),
  useQuery: jest.fn()
}));

jest.mock('../shared/ProfileEditModal', () => props => props.show ? (
  <div data-testid="tenant-modal">
    {props.submitError && <div role="alert">{props.submitError}</div>}
    <button
      onClick={() => props.onSubmit({
        name: 'Synthetic Tenant',
        email: 'tenant@example.invalid',
        phone: '555-0100',
        address: '1 Test Way',
        city: 'Test City',
        state: 'SC',
        zip: '29000',
        contactPref: 'EMAIL',
        allowText: false,
        balance: 500,
        billingFreq: 'ANNUAL'
      })}
      disabled={props.isSubmitting}
    >
      Submit tenant
    </button>
  </div>
) : null);

const property = {
  id: 'property-1',
  address: '1 Test Way',
  city: 'Test City',
  state: 'SC',
  zip: '29000',
  profOwnerId: 'owner-profile'
};

function renderCard(addTenant, onTenantAdded = jest.fn()) {
  const updateProfile = jest.fn();
  useMutation.mockImplementation(mutation => {
    if (mutation === ADD_TENANT_TO_MY_PROPERTY) return [addTenant];
    if (mutation === UPDATE_PROFILE) return [updateProfile];
    throw new Error('Unexpected mutation');
  });

  render(
    <PropertyCard
      property={property}
      currentProfileId="owner-profile"
      onTenantAdded={onTenantAdded}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Add Tenant' }));
  return { onTenantAdded, updateProfile };
}

beforeEach(() => {
  useMutation.mockReset();
  useQuery.mockReset();
  useQuery.mockReturnValue({ data: undefined });
});

test('uses one allowlisted operation, refetches, and closes only after success', async () => {
  const addTenant = jest.fn().mockResolvedValue({
    data: {
      addTenantToMyProperty: {
        id: 'tenant-id',
        cognitoID: null,
        name: 'Synthetic Tenant',
        email: 'tenant@example.invalid',
        phone: '555-0100'
      }
    }
  });
  const onTenantAdded = jest.fn().mockResolvedValue();
  renderCard(addTenant, onTenantAdded);

  fireEvent.click(screen.getByRole('button', { name: 'Submit tenant' }));

  await waitFor(() => expect(onTenantAdded).toHaveBeenCalledTimes(1));
  expect(await screen.findByText('Name: Synthetic Tenant')).toBeInTheDocument();
  expect(addTenant).toHaveBeenCalledTimes(1);
  expect(addTenant).toHaveBeenCalledWith({
    variables: {
      input: {
        propertyId: 'property-1',
        name: 'Synthetic Tenant',
        email: 'tenant@example.invalid',
        phone: '555-0100',
        address: '1 Test Way',
        city: 'Test City',
        state: 'SC',
        zip: '29000',
        contactPref: 'EMAIL',
        allowText: false
      }
    }
  });
  expect(new Set(useMutation.mock.calls.map(([mutation]) => mutation))).toEqual(new Set([
    ADD_TENANT_TO_MY_PROPERTY,
    UPDATE_PROFILE
  ]));
  expect(screen.queryByTestId('tenant-modal')).not.toBeInTheDocument();
});

test('shows a generic error and keeps the modal open on rejection', async () => {
  renderCard(jest.fn().mockRejectedValue(new Error('backend detail')));
  fireEvent.click(screen.getByRole('button', { name: 'Submit tenant' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to add tenant. Please try again.');
  expect(screen.getByTestId('tenant-modal')).toBeInTheDocument();
});

test('prevents duplicate submits while the operation is pending', async () => {
  let resolveMutation;
  const addTenant = jest.fn(() => new Promise(resolve => {
    resolveMutation = resolve;
  }));
  renderCard(addTenant);

  const submit = screen.getByRole('button', { name: 'Submit tenant' });
  fireEvent.click(submit);
  fireEvent.click(submit);
  expect(addTenant).toHaveBeenCalledTimes(1);

  await act(async () => {
    resolveMutation({ data: { addTenantToMyProperty: { id: 'tenant-id' } } });
  });
});

test('loads a linked tenant by id and lets the owner edit a tenant without Cognito', () => {
  const tenant = {
    id: 'tenant-id',
    cognitoID: null,
    name: 'Linked Tenant',
    email: 'linked@example.invalid',
    phone: '555-0101'
  };
  useQuery.mockImplementation(query => {
    expect(query).toBe(GET_TENANT_PROFILE);
    return { data: { getProfile: tenant } };
  });
  const updateProfile = jest.fn();
  useMutation.mockImplementation(mutation => {
    if (mutation === ADD_TENANT_TO_MY_PROPERTY) return [jest.fn()];
    if (mutation === UPDATE_PROFILE) return [updateProfile];
    throw new Error('Unexpected mutation');
  });

  render(
    <PropertyCard
      property={{ ...property, profTenantId: tenant.id }}
      currentProfileId="owner-profile"
    />
  );

  expect(screen.getByText('Name: Linked Tenant')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Update Tenant' })).toBeInTheDocument();
});

test('refetches the tenant and closes only after a successful update', async () => {
  const tenant = {
    id: 'tenant-id',
    cognitoID: null,
    name: 'Linked Tenant',
    email: 'linked@example.invalid',
    phone: '555-0101'
  };
  useQuery.mockReturnValue({ data: { getProfile: tenant } });
  const updateProfile = jest.fn().mockResolvedValue({ data: { updateProfile: tenant } });
  useMutation.mockImplementation(mutation => {
    if (mutation === ADD_TENANT_TO_MY_PROPERTY) return [jest.fn()];
    if (mutation === UPDATE_PROFILE) return [updateProfile];
    throw new Error('Unexpected mutation');
  });
  const onTenantAdded = jest.fn().mockResolvedValue();

  render(
    <PropertyCard
      property={{ ...property, profTenantId: tenant.id }}
      currentProfileId="owner-profile"
      onTenantAdded={onTenantAdded}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Update Tenant' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit tenant' }));

  await waitFor(() => expect(onTenantAdded).toHaveBeenCalledTimes(1));
  expect(updateProfile).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('tenant-modal')).not.toBeInTheDocument();
});

test('does not let the owner edit a tenant with a Cognito profile', () => {
  useQuery.mockReturnValue({
    data: {
      getProfile: {
        id: 'tenant-id',
        cognitoID: 'tenant-cognito-id',
        name: 'Cognito Tenant',
        email: 'cognito@example.invalid'
      }
    }
  });
  useMutation.mockImplementation(() => [jest.fn()]);

  render(
    <PropertyCard
      property={{ ...property, profTenantId: 'tenant-id' }}
      currentProfileId="owner-profile"
    />
  );

  expect(screen.getByText('Name: Cognito Tenant')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Update Tenant' })).not.toBeInTheDocument();
});
