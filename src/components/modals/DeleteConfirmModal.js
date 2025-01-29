import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { DELETE_BULLETIN } from '../../queries/mutations';
import { BULLETINS_BY_DATE } from '../../queries/queries';
import Modal from '../shared/Modal';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ bulletin, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [deleteBulletin] = useMutation(DELETE_BULLETIN, {
    update(cache, { data: { deleteBulletin } }) {
      const existingData = cache.readQuery({
        query: BULLETINS_BY_DATE,
        variables: { limit: 10 }
      });
      
      if (existingData && existingData.bulletinsByDate) {
        cache.writeQuery({
          query: BULLETINS_BY_DATE,
          variables: { limit: 10 },
          data: {
            bulletinsByDate: {
              ...existingData.bulletinsByDate,
              items: existingData.bulletinsByDate.items.filter(item => item.id !== deleteBulletin.id)
            }
          }
        });
      }
    }
  });

  const handleDelete = async () => {
    if (confirmText === bulletin.title) {
      try {
        await deleteBulletin({
          variables: {
            input: { id: bulletin.id }
          }
        });
        onClose();
      } catch (error) {
        console.error('Error deleting bulletin:', error);
      }
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="delete-confirm-modal">
        <h2>Delete Bulletin</h2>
        <p>To confirm deletion, please type the bulletin title:</p>
        <p className="bulletin-title">{bulletin.title}</p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type bulletin title here"
        />
        <div className="modal-actions">
          <button 
            className="delete-button"
            onClick={handleDelete}
            disabled={confirmText !== bulletin.title}
          >
            Delete
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
