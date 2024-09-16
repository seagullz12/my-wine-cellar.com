import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css'; // Import the CSS for styling
import { FaBars, FaTimes } from 'react-icons/fa'; // Import the hamburger icons

const NavBar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo">WineScanner</h1>
        <div className="navbar-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </div>
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/wine-scanner" className="navbar-item" onClick={() => setMenuOpen(false)}>Home</Link>
          </li>
          <li>
            <Link to="/wine-scanner/cellar" className="navbar-item" onClick={() => setMenuOpen(false)}>My Wine Cellar</Link>
          </li>
          {/* Add more links as needed */}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
