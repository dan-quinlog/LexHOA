import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { LIST_DOCUMENTS } from '../../queries/documentQueries';
import { DELETE_DOCUMENT, UPDATE_DOCUMENT } from '../../queries/documentMutations';
import { remove } from 'aws-amplify/storage';
import DocumentUploadModal from '../modals/DocumentUploadModal';
import './shared/BoardTools.css';

const DocumentManager = ({ user }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const { data, loading, error, refetch } = useQuery(LIST_DOCUMENTS, {
    variables: {
      filter: {
        isArchived: { eq: false }
      },
      limit: 100
    }
  });

  const [deleteDocument] = useMutation(DELETE_DOCUMENT, {
    onCompleted: () => {
      refetch();
    }
  });

  const [updateDocument] = useMutation(UPDATE_DOCUMENT, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleDelete = async (document) => {
    if (!window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }

    try {
      // Delete from S3
      await remove({
        key: document.s3Key,
        options: {
          accessLevel: 'guest'
        }
      });

      // Delete from database
      await deleteDocument({
        variables: {
          input: {
            id: document.id
          }
        }
      });

      alert('Document deleted successfully');
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Error deleting document: ' + err.message);
    }
  };

  const handleArchive = async (document) => {
    try {
      await updateDocument({
        variables: {
          input: {
            id: document.id,
            isArchived: true
          }
        }
      });
      alert('Document archived successfully');
    } catch (err) {
      console.error('Error archiving document:', err);
      alert('Error archiving document: ' + err.message);
    }
  };

  const getCategoryDisplayName = (category) => {
    const names = {
      BYLAWS_CCRS: 'Bylaws & CC&Rs',
      INSURANCE: 'Insurance',
      MEETING_MINUTES: 'Meeting Minutes',
      FINANCIAL_REPORTS: 'Financial Reports',
      POLICIES: 'Policies & Procedures',
      FORMS: 'Forms',
      BOARD_ONLY: 'Board Documents',
      OTHER: 'Other'
    };
    return names[category] || category;
  };

  const getAccessLevelDisplay = (level) => {
    const displays = {
      PUBLIC: '🌐 Public',
      AUTHENTICATED: '🔐 Authenticated',
      OWNERS_ONLY: '🏠 Owners Only',
      BOARD_ONLY: '👥 Board Only',
      TREASURER_ONLY: '💰 Treasurer Only',
      PRESIDENT_ONLY: '⭐ President Only'
    };
    return displays[level] || level;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredDocuments = data?.listDocuments?.items?.filter(doc => {
    if (categoryFilter === 'ALL') return true;
    return doc.category === categoryFilter;
  }) || [];

  if (loading) return <div className="board-tool"><p>Loading documents...</p></div>;
  if (error) return <div className="board-tool"><p className="error">Error loading documents</p></div>;

  return (
    <div className="board-tool">
      <div className="card-header">
        <h2 className="section-title">Document Manager</h2>
        <button
          className="action-button"
          onClick={() => {
            console.log('Upload Document button clicked');
            setEditingDocument(null);
            setShowUploadModal(true);
            console.log('showUploadModal set to true');
          }}
          style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
        >
          + Upload Document
        </button>
      </div>

      <div className="search-controls">
        <select
          className="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="BYLAWS_CCRS">Bylaws & CC&Rs</option>
          <option value="INSURANCE">Insurance</option>
          <option value="MEETING_MINUTES">Meeting Minutes</option>
          <option value="FINANCIAL_REPORTS">Financial Reports</option>
          <option value="POLICIES">Policies & Procedures</option>
          <option value="FORMS">Forms</option>
          <option value="BOARD_ONLY">Board Documents</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {filteredDocuments.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No documents found. Click "Upload Document" to add one.
        </p>
      ) : (
        <div className="results-grid">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="item-card">
              <div className="card-header">
                <h3>{doc.title}</h3>
                {doc.year && <span style={{ color: '#666', fontSize: '0.9em' }}>({doc.year})</span>}
              </div>

              {doc.description && (
                <p style={{ fontSize: '0.9em', color: '#666', margin: '8px 0' }}>
                  {doc.description}
                </p>
              )}

              <div className="card-content" style={{ gridTemplateColumns: '1fr', gap: '8px' }}>
                <div><strong>Category:</strong> {getCategoryDisplayName(doc.category)}</div>
                <div><strong>Access Level:</strong> {getAccessLevelDisplay(doc.accessLevel)}</div>
                <div><strong>File:</strong> {doc.fileName} ({formatFileSize(doc.fileSize)})</div>
                <div><strong>Uploaded:</strong> {formatDate(doc.createdAt)}</div>
                {doc.uploadedBy && <div><strong>By:</strong> {doc.uploadedBy.name}</div>}
              </div>

              <div className="card-footer">
                <button
                  className="action-button"
                  onClick={() => {
                    setEditingDocument(doc);
                    setShowUploadModal(true);
                  }}
                  style={{ backgroundColor: 'var(--secondary-color)', color: 'white' }}
                >
                  Edit
                </button>
                <button
                  className="action-button"
                  onClick={() => handleArchive(doc)}
                  style={{ backgroundColor: 'var(--warning-color)', color: 'white' }}
                >
                  Archive
                </button>
                <button
                  className="action-button"
                  onClick={() => handleDelete(doc)}
                  style={{ backgroundColor: 'var(--error-color)', color: 'white' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <DocumentUploadModal
          document={editingDocument}
          user={user}
          onClose={() => {
            console.log('Modal closing');
            setShowUploadModal(false);
            setEditingDocument(null);
          }}
          onSuccess={() => {
            console.log('Upload success');
            setShowUploadModal(false);
            setEditingDocument(null);
            refetch();
          }}
        />
      )}
      {console.log('showUploadModal state:', showUploadModal)}
    </div>
  );
};

export default DocumentManager;
