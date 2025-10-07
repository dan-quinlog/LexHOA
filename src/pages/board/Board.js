import React, { useState } from 'react';
import BulletinManager from '../../components/board/BulletinManager'
import PersonManager from '../../components/board/PersonManager';
import PropertyManager from '../../components/board/PropertyManager';
import PaymentManager from '../../components/board/PaymentManager';
import PingManager from '../../components/board/PingManager';
import BoardRoleManager from '../../components/board/BoardRoleManager';
import DocumentManager from '../../components/board/DocumentManager';
import './Board.css';

const TOOLS = [
  { id: 'bulletins', label: 'Bulletins' },
  { id: 'documents', label: 'Documents' },
  { id: 'pings', label: 'Ping Management' },
  { id: 'persons', label: 'Person Management' },
  { id: 'properties', label: 'Property Management' },
  { id: 'payments', label: 'Payment Management' },
  { id: 'roles', label: 'Board Role Manager' }
];

const Board = ({ userGroups = [], user }) => {
  const [selectedTool, setSelectedTool] = useState('bulletins');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // New state management
  const [personSearchState, setPersonSearchState] = useState({
    searchType: 'name',
    searchValue: '',
    searchResults: []
  });

  const [propertySearchState, setPropertySearchState] = useState({
    searchType: 'propertyId',
    searchTerm: '',
    searchResults: []
  });

  const [paymentSearchState, setPaymentSearchState] = useState({
    searchType: 'ownerId',
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
        return <BulletinManager userGroups={userGroups} />;
      case 'documents':
        return <DocumentManager user={user} />;
      case 'persons':
        return <PersonManager
          searchState={personSearchState}
          setSearchState={setPersonSearchState}
          userGroups={userGroups}
        />;
      case 'properties':
        return <PropertyManager
          searchState={propertySearchState}
          setSearchState={setPropertySearchState}
          userGroups={userGroups}
        />;
      case 'payments':
        return <PaymentManager
          searchState={paymentSearchState}
          setSearchState={setPaymentSearchState}
          userGroups={userGroups}
        />;
      case 'pings':
        return <PingManager
          searchState={pingSearchState}
          setSearchState={setPingSearchState}
          userGroups={userGroups}
        />;
      case 'roles':
        return <BoardRoleManager userGroups={userGroups} />;
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
