import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';import { BULLETINS_BY_DATE } from '../../queries/queries';
import { DELETE_BULLETIN } from '../../queries/mutations';
import BulletinModal from '../modals/BulletinModal';
import DeleteConfirmModal from '../shared/DeleteConfirmationModal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import './BulletinManager.css';
import './shared/BoardTools.css';

const BulletinManager = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const loadingRef = useRef(null);

  const { loading, error, data, fetchMore } = useQuery(BULLETINS_BY_DATE, {
    variables: { 
      limit: 10,
      type: "BULLETIN",
      sortDirection: "DESC"
    }
  });

  const [deleteBulletin] = useMutation(DELETE_BULLETIN, {
    update(cache, { data: { deleteBulletin } }) {
      const existingData = cache.readQuery({
        query: BULLETINS_BY_DATE,
        variables: { limit: 10, type: "BULLETIN", sortDirection: "DESC" }
      });

      cache.writeQuery({
        query: BULLETINS_BY_DATE,
        variables: { limit: 10, type: "BULLETIN", sortDirection: "DESC" },
        data: {
          bulletinsByDate: {
            ...existingData.bulletinsByDate,
            items: existingData.bulletinsByDate.items.filter(item => item.id !== deleteBulletin.id)
          }
        }
      });
    }
  });
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && data?.bulletinsByDate?.nextToken && !loading) {
          fetchMore({
            variables: {
              limit: 10,
              type: "BULLETIN",
              sortDirection: "DESC",
              nextToken: data.bulletinsByDate.nextToken
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) return prev;
              return {
                bulletinsByDate: {
                  ...fetchMoreResult.bulletinsByDate,
                  items: [...prev.bulletinsByDate.items, ...fetchMoreResult.bulletinsByDate.items]
                }
              };
            }
          });        }
      },
      { threshold: 1.0 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [data, loading, fetchMore]);

  const handleEdit = (bulletin) => {
    setSelectedBulletin(bulletin);
    setModalOpen(true);
  };

  const handleDelete = (bulletin) => {
    setSelectedBulletin(bulletin);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id) => {
    try {
      await deleteBulletin({
        variables: { input: { id } }
      });
      setDeleteModalOpen(false);
      setSelectedBulletin(null);
    } catch (error) {
      console.error('Error deleting bulletin:', error);
    }
  };

  return (
    <div className="board-tool">
      <div className="bulletin-header">
        <h1 className="section-title">Bulletin Management</h1>
        <button 
          className="search-controls" 
          onClick={() => {
            setSelectedBulletin(null)
            setModalOpen(true)
          }}
        >
          Create Bulletin
        </button>
      </div>
      <div className="bulletin-list">
        {data?.bulletinsByDate.items.map((bulletin, index) => (
          <div
            key={bulletin.id}
            className="bulletin-item"
          >
            <div className="bulletin-header">
              <div className="bulletin-actions">
                <button onClick={() => handleEdit(bulletin)}>Edit</button>
                <button onClick={() => handleDelete(bulletin)}>Delete</button>
              </div>
              <div className="bulletin-metadata">
                <span className="bulletin-date">{new Date(bulletin.createdAt).toLocaleString()}</span>
                <span className="bulletin-audience">{bulletin.audience}</span>
              </div>
            </div>
            <div className="bulletin-content">
              <h3>{bulletin.title}</h3>
              <ReactQuill
                value={bulletin.content}
                readOnly={true}
                theme="bubble"
                modules={{ toolbar: false }}
              />
            </div>
          </div>
        ))}
        <div ref={loadingRef} style={{ height: '20px' }}>
          {loading && 'Loading more bulletins...'}
        </div>
      </div>

      <BulletinModal
        bulletin={selectedBulletin}
        modalOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBulletin(null);
        }}
      />

      <DeleteConfirmModal
        show={deleteModalOpen}
        objectId={selectedBulletin?.id}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedBulletin(null);
        }}
      />
    </div>
  );
};
export default BulletinManager;
