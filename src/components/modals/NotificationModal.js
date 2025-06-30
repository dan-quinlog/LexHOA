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
    <div className="notification-modal">
      <div className="notification-content">
        {message}
      </div>
    </div>
  );
};

export default NotificationModal;
