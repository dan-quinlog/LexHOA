import React from 'react';
import './Modal.css';

const Modal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {message}
      </div>
    </div>
  );
};

export default Modal;