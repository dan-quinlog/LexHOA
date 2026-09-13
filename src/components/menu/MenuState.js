import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BOARD_GROUP = process.env.REACT_APP_BOARD_GROUP_NAME;

const MenuState = ({ userGroups, onSignOut, renderMenuItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const closeMenu = () => setIsOpen(false);

  const renderMenuItemsWithClose = () => {
    const menuItems = [
      { label: 'Profile', path: '/profile' },
      { label: 'Documents', path: '/documents' },
      { label: 'Board', path: '/board', group: BOARD_GROUP },
      { label: 'Amenities', path: '/amenities' },
      { label: 'Contact', path: '/contact' }
    ];

    return menuItems
      .filter(item => !item.group || userGroups.includes(item.group))
      .map((item, index) => (
        <Link key={index} to={item.path} onClick={closeMenu}>
          {item.label}
        </Link>
      ));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="hamburger-menu" ref={menuRef}>
      <button
        type="button"
        className="hamburger-button"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span aria-hidden="true" className="hamburger-icon" />
      </button>
      {isOpen && (
        <nav className="dropdown-menu" aria-label="Account navigation">
          {renderMenuItemsWithClose()}
          <button onClick={() => {
            closeMenu();
            onSignOut();
          }}>Sign Out</button>
        </nav>
      )}
    </div>
  );
};
export default MenuState;
