import React, { useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { GET_PROFILE } from '../../queries/queries';
import { ISSUE_INVOICE } from '../../queries/mutations';
import { formatCurrency } from '../../utils/payments';
import Modal from '../shared/Modal';
import './PaymentEditModal.css';
import './InvoiceManager.css';

const INVOICE_TYPES = [
  { value: 'ASSESSMENT', label: 'Assessment' },
  { value: 'LATE_FEE', label: 'Late Fee' },
  { value: 'ADJUSTMENT', label: 'Adjustment (may be negative)' },
  { value: 'DUES', label: 'Dues' }
];
const emptyLine = () => ({ propertyId: '', description: '', amount: '' });
const today = () => new Date().toLocaleDateString('en-CA');

const InvoiceCreateModal = ({ onClose, onCreated }) => {
  const client = useApolloClient();
  const [issueInvoice] = useMutation(ISSUE_INVOICE);
  const [form, setForm] = useState({
    ownerInvoicesId: '',
    type: 'ASSESSMENT',
    billingPeriod: '',
    dateApplied: today(),
    dateDue: '',
    description: '',
    balanceApplied: true
  });
  const [lineItems, setLineItems] = useState([emptyLine()]);
  const [owner, setOwner] = useState(null);
  const [ownerError, setOwnerError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));
  const setLine = (index, name, value) =>
    setLineItems(prev => prev.map((line, i) => (i === index ? { ...line, [name]: value } : line)));

  const lookUpOwner = async () => {
    const id = form.ownerInvoicesId.trim();
    setOwner(null);
    setOwnerError('');
    if (!id) return;
    try {
      const { data } = await client.query({ query: GET_PROFILE, variables: { id }, fetchPolicy: 'network-only' });
      if (data?.getProfile) setOwner(data.getProfile);
      else setOwnerError('No profile has this ID.');
    } catch (error) {
      console.error('Owner lookup failed:', error);
      setOwnerError('Unable to look up this owner.');
    }
  };

  const properties = owner?.ownedProperties?.items?.filter(Boolean) || [];
  const totalCents = lineItems.reduce((sum, line) => sum + Math.round((parseFloat(line.amount) || 0) * 100), 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    if (!owner) {
      setSubmitError('Look up the owner before creating the invoice.');
      return;
    }
    if (!form.dateApplied || !form.dateDue || lineItems.some(line => line.amount === '')) {
      setSubmitError('Complete the dates and every line item amount.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await issueInvoice({
        variables: {
          input: {
            ownerInvoicesId: owner.id,
            type: form.type,
            billingPeriod: form.billingPeriod.trim() || null,
            dateApplied: form.dateApplied,
            dateDue: form.dateDue,
            description: form.description.trim() || null,
            balanceApplied: form.balanceApplied,
            lineItems: lineItems.map(line => ({
              propertyId: line.propertyId || null,
              description: line.description.trim() || null,
              amount: parseFloat(line.amount)
            }))
          }
        }
      });
      onCreated(data.issueInvoice);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setSubmitError(error?.graphQLErrors?.[0]?.message || 'Unable to create the invoice.');
      setSaving(false);
    }
  };

  return (
    <Modal show onClose={onClose} size="large">
      <div className="payment-edit-modal">
        <h2>Create Invoice</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-container">
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="invoice-owner">Owner ID*</label>
                <input
                  id="invoice-owner"
                  type="text"
                  value={form.ownerInvoicesId}
                  onChange={(e) => {
                    setField('ownerInvoicesId', e.target.value);
                    setOwner(null);
                  }}
                  onBlur={lookUpOwner}
                />
                {owner && <span className="invoice-owner-name">Owner: {owner.name}</span>}
                {ownerError && <span className="invoice-form-error">{ownerError}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="invoice-type">Type*</label>
                <select id="invoice-type" value={form.type} onChange={(e) => setField('type', e.target.value)}>
                  {INVOICE_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="invoice-period">Billing Period</label>
                <input
                  id="invoice-period"
                  type="text"
                  placeholder="e.g. 2027"
                  value={form.billingPeriod}
                  onChange={(e) => setField('billingPeriod', e.target.value)}
                />
              </div>
            </div>
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="invoice-date">Invoice Date*</label>
                <input id="invoice-date" type="date" value={form.dateApplied} onChange={(e) => setField('dateApplied', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="invoice-due">Due Date*</label>
                <input id="invoice-due" type="date" value={form.dateDue} onChange={(e) => setField('dateDue', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="invoice-description">
                  Description{form.type === 'ADJUSTMENT' ? '*' : ''}
                </label>
                <input
                  id="invoice-description"
                  type="text"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                />
              </div>
            </div>
          </div>

          <h3 className="invoice-lines-title">Line Items</h3>
          {lineItems.map((line, index) => (
            <div className="invoice-line" key={index}>
              <select
                aria-label={`Line ${index + 1} property`}
                value={line.propertyId}
                onChange={(e) => setLine(index, 'propertyId', e.target.value)}
              >
                <option value="">No property</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>{property.address}</option>
                ))}
              </select>
              <input
                aria-label={`Line ${index + 1} description`}
                type="text"
                placeholder="Description"
                value={line.description}
                onChange={(e) => setLine(index, 'description', e.target.value)}
              />
              <div className="currency-input">
                <span>$</span>
                <input
                  aria-label={`Line ${index + 1} amount`}
                  type="number"
                  step="0.01"
                  value={line.amount}
                  onChange={(e) => setLine(index, 'amount', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setLineItems(prev => prev.filter((_, i) => i !== index))}
                disabled={lineItems.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <div className="invoice-line-footer">
            <button type="button" onClick={() => setLineItems(prev => [...prev, emptyLine()])}>Add Line</button>
            <strong>Total: {formatCurrency(totalCents / 100)}</strong>
          </div>

          <div className="form-group apply-payment-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.balanceApplied}
                onChange={(e) => setField('balanceApplied', e.target.checked)}
              />
              Apply to balance (uncheck to record a historic invoice without changing the balance)
            </label>
          </div>

          {submitError && <div role="alert" className="invoice-form-error">{submitError}</div>}
          <div className="modal-actions">
            <button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Invoice'}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default InvoiceCreateModal;
