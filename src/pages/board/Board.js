import React, { useState } from 'react';
import BulletinManager from '../../components/board/BulletinManager'
import PersonManager from '../../components/board/PersonManager';
import PropertyManager from '../../components/board/PropertyManager';
import PaymentManager from '../../components/board/PaymentManager';
import PingManager from '../../components/board/PingManager';
import { useQuery } from '@apollo/client';
import { LIST_PROFILES } from '../../queries/queries';
import './Board.css';

const TOOLS = [
  { id: 'bulletins', label: 'Bulletins' },
  { id: 'pings', label: 'Ping Management' },
  { id: 'persons', label: 'Person Management' },
  { id: 'properties', label: 'Property Management' },
  { id: 'payments', label: 'Payment Management' }
];

const Board = () => {
  const [selectedTool, setSelectedTool] = useState('bulletins');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // New state management
  const [personSearchState, setPersonSearchState] = useState({
    searchType: 'email',
    searchValue: '',
    searchResults: []
  });

  const [propertySearchState, setPropertySearchState] = useState({
    searchType: 'propertyId',
    searchTerm: '',
    searchResults: []
  });

  const [paymentSearchState, setPaymentSearchState] = useState({
    searchType: 'paymentId',
    searchTerm: '',
    searchResults: []
  });

  const [pingSearchState, setPingSearchState] = useState({
    searchType: 'id',
    searchTerm: '',
    searchResults: []
  });

  const handleToolSelect = (toolId) => {
    setSelectedTool(toolId);
    setIsMenuOpen(false);
  };

  const renderTool = () => {
    switch (selectedTool) {
      case 'bulletins':
        return <BulletinManager />;
      case 'persons':
        return <PersonManager
          searchState={personSearchState}
          setSearchState={setPersonSearchState}
        />;
      case 'properties':
        return <PropertyManager
          searchState={propertySearchState}
          setSearchState={setPropertySearchState}
        />;
      case 'payments':
        return <PaymentManager
          searchState={paymentSearchState}
          setSearchState={setPaymentSearchState}
        />;
      case 'pings':
        return <PingManager
          searchState={pingSearchState}
          setSearchState={setPingSearchState}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <div
          className="tool-selector"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {TOOLS.find(t => t.id === selectedTool)?.label}
          <span className={`caret ${isMenuOpen ? 'open' : ''}`}>▼</span>
        </div>
        <div className={`tool-dropdown ${isMenuOpen ? 'show' : ''}`}>
          {TOOLS.map(tool => (
            <div
              key={tool.id}
              className="tool-item"
              onClick={() => handleToolSelect(tool.id)}
            >
              {tool.label}
            </div>
          ))}
        </div>
      </div>
      <div className="board-content">
        {renderTool()}
      </div>
    </div>
  );
};
export default Board;

