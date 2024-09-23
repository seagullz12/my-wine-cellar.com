// App.js
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

//import pages
import Home from './pages/Home';
import AddWine from './pages/AddWine';
import AddWineBatch from './pages/AddWineBatch';
import WineList from './pages/WineList';
import WineRecommendations from './pages/WineRecommendations';
import WineDetail from './pages/WineDetail';
import NavBar from './components/NavBar'; 
import SignIn from './pages/SignIn'; 
import SignUp from './pages/SignUp'; 
import SharedWineDetail from './pages/SharedWineDetail';
import TastingPage from './pages/TastingPage';
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
          <Route path="/shared/:token" element={<SharedWineDetail />} /> 

          {/* Protected Routes */}
          {user ? (
            <>
              <Route path="/add-wine" element={<AddWine />} />
              <Route path="/add-wine-batch" element={<AddWineBatch />} />
              <Route path="/cellar" element={<WineList />} />
              <Route path="/personal-sommelier" element={<WineRecommendations />} />
              <Route path="/cellar/:id" element={<WineDetail />} />
              <Route path="/tasting/:id" element={<TastingPage />} />
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
