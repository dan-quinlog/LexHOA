import React, { useState } from 'react';
import Modal from '../shared/Modal';
import '../shared/DeleteConfirmationModal.css';

// Asks for the reason before voiding an invoice or payment. onConfirm(reason) returns a
// promise; a rejection keeps the dialog open with the server's message.
const VoidEntryModal = ({ title, summary, warning, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setSaving(true);
    setError('');
    try {
      await onConfirm(reason.trim());
    } catch (err) {
      setError(err?.graphQLErrors?.[0]?.message || 'Unable to void. Try again.');
      setSaving(false);
    }
  };

  return (
    <Modal show onClose={onClose} size="small">
      <div className="delete-confirmation">
        <h2>{title}</h2>
        <p>{summary}</p>
        {warning && <p><strong>{warning}</strong></p>}
        <label htmlFor="void-reason">Reason for voiding</label>
        <input
          id="void-reason"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && <p role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" onClick={handleConfirm} disabled={!reason.trim() || saving}>
            {saving ? 'Voiding...' : 'Void'}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

export default VoidEntryModal;
