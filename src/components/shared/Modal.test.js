import { fireEvent, render, screen } from '@testing-library/react';
import Modal from './Modal';

test('provides keyboard and explicit-button dismissal', () => {
  const onClose = jest.fn();
  render(
    <Modal show onClose={onClose} size="small">
      <h2>Test dialog</h2>
      <button type="button">Continue</button>
    </Modal>
  );

  expect(screen.getByRole('dialog')).toHaveClass('modal-small');
  expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
  expect(document.body.style.overflow).toBe('hidden');

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
  expect(onClose).toHaveBeenCalledTimes(2);
});
