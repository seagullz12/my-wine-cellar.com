import React from 'react';
import NavBar from './NavBar'; // Ensure NavBar is correctly imported
import '../styles/Header.css'; // Import CSS for the header styling

const Header = () => {
  return (
    <header className="header">
      <NavBar />
      <div className="header-content">
        <h1 className="header-title">Welcome to Wine Scanner</h1>
        <p className="header-tagline">Discover and manage your favorite wines with ease</p>
        <a href="/wine-scanner" className="header-cta">Get Started</a>
      </div>
    </header>
  );
};

export default Header;
