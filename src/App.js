// App.js
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Home from './components/Home';
import AddWine from './components/AddWine';
import AddWineBatch from './components/AddWineBatch';
import WineList from './components/WineList';
import WineRecommendations from './components/WineRecommendations';
import WineDetail from './components/WineDetail';
import NavBar from './components/NavBar'; 
import SignIn from './components/SignIn'; 
import SignUp from './components/SignUp'; 
import './styles/global.css';

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
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />

          {/* Protected Routes */}
          {user ? (
            <>
              <Route path="/add-wine" element={<AddWine />} />
              <Route path="/add-wine-batch" element={<AddWineBatch />} />
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
