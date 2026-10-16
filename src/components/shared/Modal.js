import React, { useEffect, useRef } from 'react';
import './Modal.css';

const Modal = ({ children, onClose, show, size = 'medium' }) => {
  const modalRef = useRef();
  const closeButtonRef = useRef();
  // Callers often pass a new onClose on every render; reading it from a ref keeps
  // the focus setup below from re-running and stealing focus while the user types.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!show) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`modal-content modal-${size}`}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Dialog"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="modal-close-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
