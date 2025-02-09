import React, { useState } from 'react';
import Modal from './Modal';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ show, objectId, onConfirm, onClose }) => {
  const [confirmId, setConfirmId] = useState('');

  const handleConfirm = () => {
    if (confirmId === objectId) {
      onConfirm(objectId);
      setConfirmId('');
    }
  };

  const handleClose = () => {
    setConfirmId('');
    onClose();
  };

  return (
    <Modal show={show} onClose={handleClose}>
      <div className="delete-confirmation">
        <h2>Confirm Deletion</h2>
        <p>ID: {objectId}</p>
        <p>Enter the ID to confirm delete:</p>
        <input
          type="text"
          value={confirmId}
          onChange={(e) => setConfirmId(e.target.value)}
        />
        <div className="modal-actions">
          <button
            className="danger"
            onClick={handleConfirm}
            disabled={confirmId !== objectId}
          >
            Delete
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;