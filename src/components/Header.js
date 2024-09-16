import React from 'react';
import './Header.css'; // Make sure you have appropriate styles

const Header = () => {
  return (
    <header className="header">
      <img src="/cellar.png" alt="Cellar Icon" className="header-icon" />
      <h1>Cellar</h1>
    </header>
  );
};

export default Header;
