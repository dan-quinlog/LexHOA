import React, { useState } from 'react';
import Modal from './Modal';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ id, onConfirm, onClose }) => {
  const [confirmId, setConfirmId] = useState('');

  const handleConfirm = () => {
    if (confirmId === id) {
      onConfirm();
    }
  };

  return (
    <Modal show={true} onClose={onClose}>
      <div className="delete-confirmation">
        <h2>To confirm deletion of record</h2>
        <p>{id}</p>
        <p>please enter its id below</p>
        <input
          type="text"
          value={confirmId}
          onChange={(e) => setConfirmId(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={handleConfirm}>Confirm</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
