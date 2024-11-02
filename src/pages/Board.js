import React, { useState } from 'react';
import BulletinManager from '../components/board/BulletinManager';
import PersonManager from '../components/board/PersonManager';
import './Board.css';

const TOOLS = [
  { id: 'bulletins', label: 'Bulletins' },
  { id: 'persons', label: 'Person Management' }
];

const Board = () => {
  const [selectedTool, setSelectedTool] = useState('bulletins');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToolSelect = (toolId) => {
    setSelectedTool(toolId);
    setIsMenuOpen(false);
  };

  const renderTool = () => {
    switch(selectedTool) {
      case 'bulletins':
        return <BulletinManager />;
      case 'persons':
        return <PersonManager />;
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