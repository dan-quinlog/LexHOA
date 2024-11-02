import React, { useState, useRef, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BULLETINS } from '../../queries/queries';
import BulletinModal from './BulletinModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import './BulletinManager.css';

const BulletinManager = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const observer = useRef();
  
  const { loading, error, data, fetchMore } = useQuery(GET_BULLETINS, {
    variables: { limit: 10 }
  });

  const lastBulletinRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && data.listBulletins.nextToken) {
        fetchMore({
          variables: {
            nextToken: data.listBulletins.nextToken
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              listBulletins: {
                ...fetchMoreResult.listBulletins,
                items: [
                  ...prev.listBulletins.items,
                  ...fetchMoreResult.listBulletins.items
                ]
              }
            };
          }
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, data, fetchMore]);

  const handleEdit = (bulletin) => {
    setSelectedBulletin(bulletin);
    setModalOpen(true);
  };

  const handleDelete = (bulletin) => {
    setSelectedBulletin(bulletin);
    setDeleteModalOpen(true);
  };

  return (
    <div className="bulletin-manager">
      <div className="bulletin-header">
        <h2>Bulletin Management</h2>
        <button onClick={() => setModalOpen(true)}>Create Bulletin</button>
      </div>
      
      <div className="bulletin-list">
        {data?.listBulletins.items.map((bulletin, index) => (
          <div 
            key={bulletin.id} 
            ref={index === data.listBulletins.items.length - 1 ? lastBulletinRef : null}
            className="bulletin-item"
          >
            <div className="bulletin-actions">
              <button onClick={() => handleEdit(bulletin)}>Edit</button>
              <button onClick={() => handleDelete(bulletin)}>Delete</button>
            </div>
            <div className="bulletin-content">
              <h3>{bulletin.title}</h3>
              <p>{bulletin.content}</p>
              <span>{new Date(bulletin.datePosted).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <BulletinModal 
          bulletin={selectedBulletin}
          onClose={() => {
            setModalOpen(false);
            setSelectedBulletin(null);
          }}
        />
      )}

      {deleteModalOpen && (
        <DeleteConfirmModal
          bulletin={selectedBulletin}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedBulletin(null);
          }}
        />
      )}
    </div>
  );
};

export default BulletinManager;