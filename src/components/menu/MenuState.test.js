import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MenuState from './MenuState';

test('opens an accessible dropdown and closes it with Escape', () => {
  render(
    <MemoryRouter>
      <MenuState userGroups={[]} onSignOut={jest.fn()} />
    </MemoryRouter>
  );

  const trigger = screen.getByRole('button', { name: 'Open navigation menu' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('navigation', { name: 'Account navigation' })).toBeInTheDocument();

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('navigation', { name: 'Account navigation' })).not.toBeInTheDocument();
});
