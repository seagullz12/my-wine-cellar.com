import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import the hamburger icons
import '../styles/NavBar.css'; // Import the CSS for styling

const NavBar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation(); // Get the current location

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

  // Determine the title based on the current pathname
  const getTitle = () => {
    switch (location.pathname) {
      case '/cellar':
        return 'My Wine Cellar';
      case '/personal-sommelier':
        return 'Personal Sommelier';
      case '/sign-in':
        return 'Sign In';
      case '/sign-up':
        return 'Sign Up';
      default:
        return 'Wine Scanner'; // Default title
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* <Link to="/" className="navbar-logo">Wine Scanner</Link> */}
        <h1 className="navbar-title">{getTitle()}</h1> {/* Display the current page title */}
        <div className="navbar-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </div>
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" className="navbar-item" onClick={() => setMenuOpen(false)}>Home</Link>
          </li>
          <li>
            <Link to="/cellar" className="navbar-item" onClick={() => setMenuOpen(false)}>My Wine Cellar</Link>
          </li>
          <li>
            <Link to="/personal-sommelier" className="navbar-item" onClick={() => setMenuOpen(false)}>Personal Sommelier</Link>
          </li>
          {!user ? (
            <>
              <li>
                <Link to="/sign-in" className="navbar-item" onClick={() => setMenuOpen(false)}>Sign In</Link>
              </li>
              <li>
                <Link to="/sign-up" className="navbar-item" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </li>
            </>
          ) : (
            <li>
              <button className="navbar-item navbar-item-signout" onClick={handleSignOut}>Sign Out</button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
