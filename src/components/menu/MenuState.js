import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BOARD_GROUP = process.env.REACT_APP_BOARD_GROUP_NAME;
const OWNERS_GROUP = process.env.REACT_APP_OWNERS_GROUP_NAME;
const RESIDENTS_GROUP = process.env.REACT_APP_RESIDENTS_GROUP_NAME;

const MenuState = ({ userGroups, onSignOut, renderMenuItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const closeMenu = () => setIsOpen(false);

  const renderMenuItemsWithClose = () => {
    const menuItems = [
      { label: 'Profile', path: '/profile' },
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="hamburger-menu" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)}>☰</button>
      {isOpen && (
        <div className="dropdown-menu">
          {renderMenuItemsWithClose()}
          <button onClick={() => {
            closeMenu();
            onSignOut();
          }}>Sign Out</button>
        </div>
      )}
    </div>
  );
};
export default MenuState;

