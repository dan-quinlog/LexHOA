import React, { useEffect } from 'react';
import './NotificationModal.css';

const NotificationModal = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // 2 second show + 1 second fade

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="notification-modal" role="status">
      <div className="notification-content">
        <span>{message}</span>
        <button type="button" onClick={onClose} aria-label="Dismiss notification">×</button>
      </div>
    </div>
  );
};

export default NotificationModal;
