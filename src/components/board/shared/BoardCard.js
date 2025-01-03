import React from 'react';
import './BoardCard.css';

const BoardCard = ({ header, content, actions, status }) => {
  return (
    <div className="item-card">
      <div className="card-header">
        {header}
        {status && <span className={`status-badge ${status}`}>{status}</span>}
      </div>
      <div className="card-content">
        {content}
      </div>
      <div className="card-footer">
        {actions}
      </div>
    </div>
  );
};

export default BoardCard;