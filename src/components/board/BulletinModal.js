import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_BULLETIN, UPDATE_BULLETIN } from '../../queries/mutations';
import { GET_LATEST_BULLETINS } from '../../queries/queries';
import Modal from '../Modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './BulletinModal.css';
import NotificationModal from '../NotificationModal';


const AUDIENCE_OPTIONS = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'RESIDENTS', label: 'Resident' },
  { value: 'OWNERS', label: 'Owner' },
  { value: 'BOARD', label: 'Board' }
];

const BulletinModal = ({ bulletin, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: ['PUBLIC'] // Now an array
  });

  const [createBulletin] = useMutation(CREATE_BULLETIN, {
    update(cache, { data: { createBulletin } }) {
      try {
        const existingData = cache.readQuery({
          query: GET_LATEST_BULLETINS,
          variables: { limit: 10 }
        });

        if (existingData && existingData.bulletinsByDate) {
          cache.writeQuery({
            query: GET_LATEST_BULLETINS,
            variables: { limit: 10 },
            data: {
              bulletinsByDate: {
                ...existingData.bulletinsByDate,
                items: [createBulletin, ...existingData.bulletinsByDate.items],
                nextToken: existingData.bulletinsByDate.nextToken
              }
            }
          });
        }
      } catch (error) {
        // Cache will be updated by refetchQueries
      }
    },
    refetchQueries: [
      {query: GET_LATEST_BULLETINS, variables: { limit: 10 }}
    ]
  });  const [updateBulletin] = useMutation(UPDATE_BULLETIN);
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
        onClose();
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
