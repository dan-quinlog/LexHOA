import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

test('keeps focus in a field while typing re-renders the dialog with a new onClose', () => {
  const onClose = jest.fn();
  const Form = () => {
    const [title, setTitle] = useState('');
    return (
      <Modal show onClose={() => onClose(title)}>
        <label htmlFor="title">Title</label>
        <input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
      </Modal>
    );
  };
  render(<Form />);

  const title = screen.getByLabelText('Title');
  userEvent.click(title);
  userEvent.type(title, 'Pool closed');

  expect(title).toHaveValue('Pool closed');
  expect(title).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledWith('Pool closed');
});

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
