import React, { useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { BOARD_INVOICES_BY_NUMBER, BOARD_INVOICES_BY_OWNER, RECENT_INVOICES } from '../../queries/queries';
import { VOID_INVOICE } from '../../queries/mutations';
import BoardCard from './shared/BoardCard';
import InvoiceCreateModal from './InvoiceCreateModal';
import VoidEntryModal from './VoidEntryModal';
import { copyWithFeedback } from '../../utils/clipboardUtils';
import { formatCurrency } from '../../utils/payments';
import './shared/BoardTools.css';
import './InvoiceManager.css';

const TREASURER_GROUP = process.env.REACT_APP_TREASURER_GROUP_NAME;
const PRESIDENT_GROUP = process.env.REACT_APP_PRESIDENT_GROUP_NAME;
const RECENT_LIMIT = 50;

const TYPE_LABELS = { DUES: 'Dues', ASSESSMENT: 'Assessment', LATE_FEE: 'Late Fee', ADJUSTMENT: 'Adjustment' };

const SEARCHES = {
  recent: {
    label: 'Recent',
    run: client => client.query({ query: RECENT_INVOICES, variables: { limit: RECENT_LIMIT }, fetchPolicy: 'network-only' })
      .then(({ data }) => data.invoicesByTypeDateApplied.items)
  },
  ownerId: {
    label: 'Owner ID',
    placeholder: 'Enter owner ID...',
    run: (client, term) => client.query({
      query: BOARD_INVOICES_BY_OWNER,
      variables: { ownerInvoicesId: term, sortDirection: 'DESC' },
      fetchPolicy: 'network-only'
    }).then(({ data }) => data.invoicesByOwner.items)
  },
  invoiceNumber: {
    label: 'Invoice Number',
    placeholder: 'e.g. INV-000042',
    run: (client, term) => client.query({
      query: BOARD_INVOICES_BY_NUMBER,
      variables: { invoiceNumber: term.toUpperCase() },
      fetchPolicy: 'network-only'
    }).then(({ data }) => data.invoicesByInvoiceNumber.items)
  }
};

const InvoiceManager = ({ userGroups = [] }) => {
  const client = useApolloClient();
  const [voidInvoice] = useMutation(VOID_INVOICE);
  const [searchType, setSearchType] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [invoiceToVoid, setInvoiceToVoid] = useState(null);

  const canEdit = userGroups.includes(TREASURER_GROUP) || userGroups.includes(PRESIDENT_GROUP);
  const search = SEARCHES[searchType];

  const runSearch = async (type = searchType, term = searchTerm) => {
    const trimmed = term.trim();
    if (type !== 'recent' && !trimmed) return;
    setLoading(true);
    setError('');
    try {
      const items = await SEARCHES[type].run(client, trimmed);
      setResults(items.filter(Boolean));
    } catch (err) {
      console.error('Invoice search error:', err);
      setResults(null);
      setError('Unable to search invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (invoice) => {
    setShowCreate(false);
    setNotice(`Created ${invoice.invoiceNumber} for ${formatCurrency(invoice.totalAmount)}.`);
    setSearchType('ownerId');
    setSearchTerm(invoice.ownerInvoicesId);
    runSearch('ownerId', invoice.ownerInvoicesId);
  };

  const confirmVoid = async (reason) => {
    await voidInvoice({ variables: { input: { id: invoiceToVoid.id, reason } } });
    setNotice(`Voided ${invoiceToVoid.invoiceNumber}.`);
    setInvoiceToVoid(null);
    runSearch();
  };

  return (
    <div className="board-tool">
      <h2 className="section-title">Invoices</h2>
      <div className="search-controls">
        <select
          aria-label="Search invoices by"
          className="search-type"
          value={searchType}
          onChange={(e) => {
            setSearchType(e.target.value);
            setSearchTerm('');
          }}
        >
          {Object.entries(SEARCHES).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {searchType !== 'recent' && (
          <input
            aria-label="Search term"
            className="search-input"
            type="text"
            placeholder={search.placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
          />
        )}
        <button type="button" onClick={() => runSearch()} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
        {canEdit && <button type="button" onClick={() => setShowCreate(true)}>Create Invoice</button>}
      </div>
      {notice && <div className="invoice-notice" role="status">{notice}</div>}
      {error && <div className="error-message">{error}</div>}
      {results && results.length === 0 && <p>No invoices found.</p>}

      <div className="results-grid">
        {(results || []).map(invoice => {
          const voided = invoice.status === 'VOID';
          return (
            <BoardCard
              key={invoice.id}
              className={voided ? 'invoice-card-void' : undefined}
              header={<h3>{invoice.invoiceNumber}</h3>}
              status={voided ? 'VOID' : null}
              content={
                <>
                  <div>
                    Owner: {invoice.ownerInvoices?.name || invoice.ownerInvoicesId}
                    <button className="copy-btn" onClick={(e) => copyWithFeedback(invoice.ownerInvoicesId, e)} title="Copy Owner ID">
                      Copy
                    </button>
                  </div>
                  <div>Type: {TYPE_LABELS[invoice.type] || invoice.type}{invoice.billingPeriod ? ` (${invoice.billingPeriod})` : ''}</div>
                  <div>Total: {formatCurrency(invoice.totalAmount)}</div>
                  <div>Balance: {invoice.balanceApplied ? 'Applied' : 'Record only'}</div>
                  <div>Invoice Date: {invoice.dateApplied}</div>
                  <div>Due: {invoice.dateDue}</div>
                  <div>Created By: {invoice.createdBy || 'Not recorded'}</div>
                  {invoice.description && <div>Description: {invoice.description}</div>}
                  <ul className="invoice-card-lines">
                    {invoice.lineItems.map((line, index) => (
                      <li key={index}>
                        <span>{[line.address, line.description].filter(Boolean).join(' — ')}</span>
                        <span>{formatCurrency(line.amount)}</span>
                      </li>
                    ))}
                  </ul>
                  {voided && (
                    <div className="invoice-card-void-details">
                      Voided {invoice.voidedAt?.slice(0, 10)} by {invoice.voidedBy}: {invoice.voidReason}
                    </div>
                  )}
                </>
              }
              actions={canEdit && !voided ? (
                <button type="button" onClick={() => setInvoiceToVoid(invoice)}>Void</button>
              ) : null}
            />
          );
        })}
      </div>

      {canEdit && showCreate && (
        <InvoiceCreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
      {canEdit && invoiceToVoid && (
        <VoidEntryModal
          title="Void Invoice"
          summary={`${invoiceToVoid.invoiceNumber} for ${formatCurrency(invoiceToVoid.totalAmount)} to ${invoiceToVoid.ownerInvoices?.name || invoiceToVoid.ownerInvoicesId}`}
          warning={invoiceToVoid.balanceApplied
            ? `${formatCurrency(invoiceToVoid.totalAmount)} will be reversed on the owner's balance.`
            : 'This invoice was record only, so the balance will not change.'}
          onConfirm={confirmVoid}
          onClose={() => setInvoiceToVoid(null)}
        />
      )}
    </div>
  );
};

export default InvoiceManager;
