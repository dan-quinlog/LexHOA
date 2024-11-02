import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_BULLETIN, UPDATE_BULLETIN } from '../../queries/mutations';
import { GET_BULLETINS } from '../../queries/queries';
import Modal from '../Modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './BulletinModal.css';
import NotificationModal from '../NotificationModal';


const AUDIENCE_OPTIONS = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'RESIDENT', label: 'Resident' },
  { value: 'OWNER', label: 'Owner' },
  { value: 'BOARD', label: 'Board' }
];

const BulletinModal = ({ bulletin, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'PUBLIC'
  });

  const [createBulletin] = useMutation(CREATE_BULLETIN, {
    update(cache, { data: { createBulletin } }) {
      const existingData = cache.readQuery({ 
        query: GET_BULLETINS,
        variables: { limit: 10 }
      });
      
      if (existingData && existingData.listBulletins) {
        cache.writeQuery({
          query: GET_BULLETINS,
          variables: { limit: 10 },
          data: {
            listBulletins: {
              ...existingData.listBulletins,
              items: [createBulletin, ...existingData.listBulletins.items]
            }
          }
        });
      }
    }
  });
  const [updateBulletin] = useMutation(UPDATE_BULLETIN);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (bulletin) {
      setFormData({
        title: bulletin.title,
        content: bulletin.content,
        audience: bulletin.audience
      });
    }
  }, [bulletin]);

  const handleSubmit = async () => {
    try {
      if (bulletin) {
        await updateBulletin({
          variables: {
            input: {
              id: bulletin.id,
              ...formData
            }
          }
        });
        setShowNotification('Bulletin updated successfully');
      } else {
        await createBulletin({
          variables: {
            input: formData
          }
        });
        setShowNotification('Bulletin posted successfully');
      }
      setTimeout(() => {
        setShowNotification(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving bulletin:', error);
    }
  };

  return (
    <>
      <Modal onClose={onClose}>
        <div className="bulletin-modal">
          <h2>{bulletin ? 'Edit Bulletin' : 'Create Bulletin'}</h2>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              tabIndex={1}
            />
          </div>
          <div className="form-group">
            <label>Audience</label>
            <select
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              tabIndex={2}
            >
              {AUDIENCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Content</label>
            <ReactQuill
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              tabIndex={3}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'color': [] }, { 'background': [] }],
                  ['image'],
                  ['clean']
                ]
              }}
            />
          </div>
          <div className="modal-actions">
            <button onClick={handleSubmit}>
              {bulletin ? 'Save' : 'Post'}
            </button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </Modal>
      {showNotification && (
        <NotificationModal 
          message={showNotification} 
          onClose={() => setShowNotification(false)} 
        />
      )}
    </>
  );
};
export default BulletinModal;
