import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MergeProfilesModal from './MergeProfilesModal';

const cognitoProfile = {
  id: 'cognito-profile',
  cognitoID: 'trusted-sub',
  name: 'Cognito Name',
  email: 'cognito@example.invalid',
  contactPref: 'EMAIL',
  billingFreq: 'MONTHLY',
  allowText: false,
  balance: 10
};
const manualProfile = {
  id: 'manual-profile',
  name: 'Manual Name',
  email: 'manual@example.invalid',
  contactPref: 'TEXT',
  billingFreq: 'ANNUAL',
  allowText: true,
  balance: 20
};

test('submits explicit source selections for every mergeable field', () => {
  const onMerge = jest.fn();
  render(
    <MergeProfilesModal
      profiles={[manualProfile, cognitoProfile]}
      show
      onClose={() => {}}
      onMerge={onMerge}
    />
  );

  fireEvent.click(screen.getByLabelText('Manual Name'));
  fireEvent.click(screen.getByLabelText('20'));
  fireEvent.click(screen.getByRole('button', { name: 'Merge Profiles' }));

  expect(onMerge).toHaveBeenCalledWith(
    cognitoProfile,
    manualProfile,
    expect.objectContaining({
      name: 'MANUAL',
      balance: 'MANUAL',
      email: 'COGNITO',
      allowText: 'COGNITO'
    })
  );
  expect(Object.keys(onMerge.mock.calls[0][2])).toHaveLength(11);
});

test('prevents duplicate submission while a merge is running', () => {
  render(
    <MergeProfilesModal
      profiles={[cognitoProfile, manualProfile]}
      show
      onClose={() => {}}
      onMerge={() => {}}
      loading
    />
  );

  expect(screen.getByRole('button', { name: 'Merging…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
});
