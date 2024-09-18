import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../styles/Home.css'; // Import the CSS file for styling
import personalSommelier from '../assets/images/personalSommelier.jpg'; // Import the image
import manageWineCollection from '../assets/images/manageWineCollection.jpg'; // Import the image
import joinUs from '../assets/images/joinUs.jpg'; // Import the image
import addWines from '../assets/images/AddWines.jpg'; // Import the image

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // Set to true if user is logged in, otherwise false
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, [auth]);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Welcome to Wine Cellar</h1>
        <h2 className="home-subtitle">Manage your wine collection with ease!</h2>
      </header>
      {!isLoggedIn && (
        <div className="sign-in">
          <Link to="/sign-in">Sign In if you have an account</Link>
        </div>
      )}
      <div className="home-grid">
        {!isLoggedIn && (
          <div className="home-card">
            <img src={joinUs} alt="Join Us" className="home-card-media" />
            <div className="home-card-content">
              <h3>Join Us</h3>
              <p>Sign up today and start your wine journey.</p>
              <Link to="/sign-up" className="home-button">Sign Up</Link>
            </div>
          </div>
        )}

        {isLoggedIn && (
          <div className="home-card">
            <img src={addWines} alt="Add Wine" className="home-card-media" />
            <div className="home-card-content">
              <h3>Add Wine</h3>
              <p>Expand your collection by adding new wines to your cellar.</p>
              <Link to="/add-wine" className="home-button">Add Wine</Link>
            </div>
          </div>
        )}

        <div className="home-card">
          <img src={manageWineCollection} alt="Manage your Wine Cellar" className="home-card-media" />
          <div className="home-card-content">
            <h3>Manage your Wine Cellar</h3>
            <p>Simplify your wine collection management and enjoyment.</p>
            <Link 
              to={isLoggedIn ? "/cellar" : "/sign-up"} 
              className="home-button"
            >
              {isLoggedIn ? "View Cellar" : "Sign Up"}
            </Link>
          </div>
        </div>

        <div className="home-card">
          <img src={personalSommelier} alt="Personal Sommelier" className="home-card-media" />
          <div className="home-card-content">
            <h3>Personal Sommelier</h3>
            <p>Get personalized recommendations and enhance your wine-tasting experience with tailored suggestions.</p>
            <Link 
              to={isLoggedIn ? "/personal-sommelier" : "/sign-up"} 
              className="home-button"
            >
              {isLoggedIn ? "Get wine advice" : "Sign Up"}
            </Link>
          </div>
        </div>

        {/* Affiliate Products */}
        {/* <div className="home-card">
          <img src={personalSommelier} alt="Buy Wine" className="home-card-media" />
          <div className="home-card-content">
            <h3>Buy Wine</h3>
            <p>Discover our recommended wines available for purchase through our trusted partners.</p>
            <a 
              href="https://example.com/affiliate-link" 
              className="home-button" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Shop Now
            </a>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default HomePage;
