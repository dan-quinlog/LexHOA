import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { LIST_DOCUMENTS } from '../../queries/documentQueries';
import { getUrl } from 'aws-amplify/storage';
import './Documents.css';

const Documents = ({ user, userGroups = [], isOwner = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error } = useQuery(LIST_DOCUMENTS, {
    variables: {
      filter: {
        isArchived: { eq: false }
      },
      limit: 100
    }
  });

  // Check user's access level
  const isBoard = userGroups.includes('BOARD') || userGroups.includes('PRESIDENT') || 
                  userGroups.includes('SECRETARY') || userGroups.includes('TREASURER');
  const isTreasurer = userGroups.includes('TREASURER') || userGroups.includes('PRESIDENT');
  const isPresident = userGroups.includes('PRESIDENT');

  // Filter documents based on user's access level
  const filteredDocuments = useMemo(() => {
    if (!data?.listDocuments?.items) return [];

    return data.listDocuments.items.filter(doc => {
      // Filter by category
      if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) {
        return false;
      }

      // Filter by search term
      if (searchTerm && !doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !doc.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by access level
      const { accessLevel } = doc;

      if (accessLevel === 'PUBLIC') return true;
      if (!user) return false; // Must be logged in for non-public docs
      if (accessLevel === 'AUTHENTICATED') return true;
      if (accessLevel === 'OWNERS_ONLY' && (isOwner || isBoard)) return true;
      if (accessLevel === 'BOARD_ONLY' && isBoard) return true;
      if (accessLevel === 'TREASURER_ONLY' && isTreasurer) return true;
      if (accessLevel === 'PRESIDENT_ONLY' && isPresident) return true;

      return false;
    }).sort((a, b) => {
      // Sort by displayOrder, then by createdAt
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [data, selectedCategory, searchTerm, user, isBoard, isTreasurer, isPresident, isOwner]);

  // Group documents by category
  const groupedDocuments = useMemo(() => {
    const groups = {};
    filteredDocuments.forEach(doc => {
      if (!groups[doc.category]) {
        groups[doc.category] = [];
      }
      groups[doc.category].push(doc);
    });
    return groups;
  }, [filteredDocuments]);

  const handleDownload = async (document) => {
    try {
      const result = await getUrl({
        key: document.s3Key,
        options: {
          accessLevel: 'public', // All documents are publicly accessible
          expiresIn: 900 // 15 minutes
        }
      });
      
      window.open(result.url, '_blank');
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Error downloading document. Please try again.');
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
      OTHER: 'Other Documents'
    };
    return names[category] || category;
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

  if (loading) {
    return (
      <div className="documents-page">
        <h1>HOA Documents</h1>
        <p>Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documents-page">
        <h1>HOA Documents</h1>
        <p className="error">Error loading documents. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="documents-page">
      <h1>HOA Documents</h1>
      
      <div className="documents-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="BYLAWS_CCRS">Bylaws & CC&Rs</option>
          <option value="INSURANCE">Insurance</option>
          <option value="MEETING_MINUTES">Meeting Minutes</option>
          <option value="FINANCIAL_REPORTS">Financial Reports</option>
          <option value="POLICIES">Policies & Procedures</option>
          <option value="FORMS">Forms</option>
          {isBoard && <option value="BOARD_ONLY">Board Documents</option>}
          <option value="OTHER">Other</option>
        </select>
      </div>

      {filteredDocuments.length === 0 ? (
        <p className="no-documents">No documents found.</p>
      ) : (
        <div className="documents-list">
          {Object.keys(groupedDocuments).map(category => (
            <div key={category} className="document-category">
              <h2>{getCategoryDisplayName(category)}</h2>
              
              {groupedDocuments[category].map(doc => (
                <div key={doc.id} className="document-item">
                  <div className="document-header">
                    <h3>{doc.title}</h3>
                    {doc.year && <span className="document-year">({doc.year})</span>}
                  </div>
                  
                  {doc.description && (
                    <p className="document-description">{doc.description}</p>
                  )}
                  
                  <div className="document-meta">
                    <span className="document-size">{formatFileSize(doc.fileSize)}</span>
                    <span className="document-date">Uploaded: {formatDate(doc.createdAt)}</span>
                    {doc.uploadedBy && (
                      <span className="document-uploader">By: {doc.uploadedBy.name}</span>
                    )}
                  </div>
                  
                  <div className="document-actions">
                    <button
                      className="download-button"
                      onClick={() => handleDownload(doc)}
                    >
                      📥 Download
                    </button>
                    {doc.fileType === 'application/pdf' && (
                      <button
                        className="view-button"
                        onClick={() => handleDownload(doc)}
                      >
                        👁 View PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;
