// App.js
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Home from './components/Home';
import WineList from './components/WineList';
import WineRecommendations from './components/WineRecommendations';
import NavBar from './components/NavBar'; // Import the NavBar component
import SignIn from './components/SignIn'; // Import the SignIn component
import SignUp from './components/SignUp'; // Import the SignUp component
import './styles/global.css';
import WineDetail from './components/WineDetail';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          {/* Public Routes */}
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />

          {/* Protected Routes */}
          {user ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/cellar" element={<WineList />} />
              <Route path="/personal-sommelier" element={<WineRecommendations />} />
              <Route path="/cellar/:id" element={<WineDetail />} />
              <Route path="*" element={<Navigate to="" />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/sign-in" />} />
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
