import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_BULLETIN, UPDATE_BULLETIN } from '../../queries/mutations';
import { BULLETINS_BY_DATE } from '../../queries/queries';
import Modal from '../shared/Modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './BulletinModal.css';
import NotificationModal from '../modals/NotificationModal';


const AUDIENCE_OPTIONS = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'RESIDENTS', label: 'Resident' },
  { value: 'OWNERS', label: 'Owner' },
  { value: 'BOARD', label: 'Board' }
];

const BulletinModal = ({ bulletin, onClose, modalOpen }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: ['PUBLIC'] // Now an array
  });
    const [createBulletin] = useMutation(CREATE_BULLETIN, {
      update(cache, { data: { createBulletin } }) {
        const existingData = cache.readQuery({
          query: BULLETINS_BY_DATE,
          variables: { 
            limit: 10,
            type: "BULLETIN",
            sortDirection: "DESC"
          }
        });

        cache.writeQuery({
          query: BULLETINS_BY_DATE,
          variables: { 
            limit: 10,
            type: "BULLETIN",
            sortDirection: "DESC"
          },
          data: {
            bulletinsByDate: {
              ...existingData.bulletinsByDate,
              items: [createBulletin, ...existingData.bulletinsByDate.items]
            }
          }
        });
      }
    });
  const [updateBulletin] = useMutation(UPDATE_BULLETIN);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (bulletin) {
      setFormData({
        title: bulletin.title,
        content: bulletin.content,
        audience: Array.isArray(bulletin.audience) ? bulletin.audience : [bulletin.audience]
      });
    }
  }, [bulletin]);

  const handleSubmit = async () => {
    if (formData.audience.length === 0) {
      setShowNotification('Please select at least one audience');
      return;
    }

    const bulletinSize = new TextEncoder().encode(JSON.stringify(formData)).length;
    const maxSize = 400000;
    
    if (bulletinSize > maxSize) {
      setShowNotification(`Content size (${Math.round(bulletinSize/1024)}KB) exceeds maximum allowed size (${Math.round(maxSize/1024)}KB)`);
      return;
    }

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
            input: {
              title: formData.title,
              content: formData.content,
              audience: formData.audience
            }
          }
        });
        setShowNotification('Bulletin posted successfully');
      }
      
      setTimeout(() => {
        setShowNotification(false);
        handleClose();
      }, 2000);
    } catch (error) {
      setShowNotification(`Error: Unable to save bulletin`);
    }
  };

  const handleAudienceChange = (value) => {
    setFormData(prevData => {
      const currentAudiences = prevData.audience || [];
      if (currentAudiences.includes(value)) {
        return {
          ...prevData,
          audience: currentAudiences.filter(a => a !== value)
        };
      } else {
        return {
          ...prevData,
          audience: [...currentAudiences, value]
        };
      }
    });
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      audience: ['PUBLIC']
    });
    onClose();
  };

  return (
    <>
      <Modal onClose={handleClose} show={modalOpen}>
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
            <div className="checkbox-group">
              {AUDIENCE_OPTIONS.map(option => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.audience.includes(option.value)}
                    onChange={() => handleAudienceChange(option.value)}
                    tabIndex={2}
                  />
                  {option.label}
                </label>
              ))}
            </div>
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
            <button onClick={handleClose}>Cancel</button>
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
