import { fireEvent, render, screen } from '@testing-library/react';
import Board from './Board';

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
