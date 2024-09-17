import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import './NavBar.css'; // Import the CSS for styling
import { FaBars, FaTimes } from 'react-icons/fa'; // Import the hamburger icons

const NavBar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  // Toggle menu visibility for mobile
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo">Wine Scanner</h1>
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
          <li>
            <Link to="/wine-scanner/personal-sommelier" className="navbar-item" onClick={() => setMenuOpen(false)}>Personal Sommelier</Link>
          </li>
          {!user ? (
            <>
              <li>
                <Link to="/wine-scanner/sign-in" className="navbar-item" onClick={() => setMenuOpen(false)}>Sign In</Link>
              </li>
              <li>
                <Link to="/wine-scanner/sign-up" className="navbar-item" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </li>
            </>
          ) : (
            <li>
              <button className="navbar-item" onClick={handleSignOut}>Sign Out</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
