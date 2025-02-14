import React from 'react';
import './PingCard.css';

const PingCard = ({ ping }) => {
  const instruction = ping.instruction;
  const statusColors = {
    APPROVED: '#4CAF50',
    REJECTED: '#F44336',
    PENDING: '#FFC107'
  };

  return (
    <div className="ping-card" style={{ borderColor: statusColors[ping.status] }}>
      <span>{instruction}</span>
      <span>{ping.status}</span>
    </div>
  );
};

export default PingCard;
