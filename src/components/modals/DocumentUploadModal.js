import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_DOCUMENT, UPDATE_DOCUMENT } from '../../queries/documentMutations';
import { uploadData } from 'aws-amplify/storage';
import Modal from '../shared/Modal';
import './DocumentUploadModal.css';

const DocumentUploadModal = ({ document, user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'INSURANCE',
    accessLevel: 'PUBLIC',
    year: new Date().getFullYear(),
    displayOrder: 0
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        description: document.description || '',
        category: document.category || 'INSURANCE',
        accessLevel: document.accessLevel || 'PUBLIC',
        year: document.year || new Date().getFullYear(),
        displayOrder: document.displayOrder || 0
      });
    }
  }, [document]);

  const [createDocument] = useMutation(CREATE_DOCUMENT);
  const [updateDocument] = useMutation(UPDATE_DOCUMENT);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Only PDF, DOC, DOCX, XLS, and XLSX files are allowed');
        return;
      }

      // Validate file size (25MB max)
      if (selectedFile.size > 25 * 1024 * 1024) {
        alert('File size must be less than 25MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!document && !file) {
      alert('Please select a file to upload');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a document title');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let s3Key = document?.s3Key;
      let fileName = document?.fileName;
      let fileSize = document?.fileSize;
      let fileType = document?.fileType;

      // Upload new file if provided
      if (file) {
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        s3Key = `documents/${timestamp}_${sanitizedFileName}`;

        const result = await uploadData({
          key: s3Key,
          data: file,
          options: {
            accessLevel: 'guest',
            contentType: file.type,
            onProgress: ({ transferredBytes, totalBytes }) => {
              if (totalBytes) {
                setProgress(Math.round((transferredBytes / totalBytes) * 100));
              }
            }
          }
        }).result;

        fileName = file.name;
        fileSize = file.size;
        fileType = file.type;
      }

      const input = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        accessLevel: formData.accessLevel,
        fileName,
        fileSize,
        fileType,
        s3Key,
        year: formData.year ? parseInt(formData.year) : null,
        displayOrder: parseInt(formData.displayOrder) || 0,
        uploadedById: user?.username
      };

      if (document) {
        // Update existing document
        await updateDocument({
          variables: {
            input: {
              id: document.id,
              ...input
            }
          }
        });
        alert('Document updated successfully!');
      } else {
        // Create new document
        await createDocument({
          variables: { input }
        });
        alert('Document uploaded successfully!');
      }

      onSuccess();
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Error uploading document: ' + err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Modal show={true} onClose={onClose}>
      <h2 style={{ marginTop: 0 }}>{document ? 'Edit Document' : 'Upload Document'}</h2>
      <form onSubmit={handleSubmit} className="document-upload-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="e.g., 2025 HOA Insurance Policy"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            maxLength={500}
            placeholder="Optional description..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
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

          <div className="form-group">
            <label>Access Level *</label>
            <select
              name="accessLevel"
              value={formData.accessLevel}
              onChange={handleChange}
              required
            >
              <option value="PUBLIC">🌐 Public</option>
              <option value="AUTHENTICATED">🔐 Authenticated Users</option>
              <option value="OWNERS_ONLY">🏠 Owners Only</option>
              <option value="BOARD_ONLY">👥 Board Only</option>
              <option value="TREASURER_ONLY">💰 Treasurer Only</option>
              <option value="PRESIDENT_ONLY">⭐ President Only</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Year (for Meeting Minutes)</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="2000"
              max="2100"
              placeholder="2025"
            />
          </div>

          <div className="form-group">
            <label>Display Order</label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
            <small>Lower numbers appear first</small>
          </div>
        </div>

        <div className="form-group">
          <label>File {document ? '(leave blank to keep current file)' : '*'}</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            required={!document}
          />
          <small>Max 25MB. Allowed: PDF, DOC, DOCX, XLS, XLSX</small>
          {file && (
            <p className="file-info">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p>Uploading... {progress}%</p>
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="submit-button"
          >
            {uploading ? 'Uploading...' : (document ? 'Update' : 'Upload')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DocumentUploadModal;
