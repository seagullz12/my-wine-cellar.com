// App.js
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'; // Add useLocation here
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Import pages
import Home from './pages/Home';
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
import AddWineDoubleOptional from './pages/AddWineDoubleOptional';
import WineDetailOrig from './pages/WineDetailOrig';

// Import analytics 
import { analytics } from './components/firebase-config';
import { logEvent } from 'firebase/analytics';

// MUI styles
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './components/theme.js'; // Import your theme

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

  // Render the Router and useLocation within it
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavBar />
        <div className="App">
          {/* Use location inside the Router */}
          <LocationTracker loading={loading} />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/shared/:token" element={<SharedWineDetail />} /> 

            {/* Protected Routes */}
            {user ? (
              <>
                <Route path="/add-wine" element={<AddWineDoubleOptional />} />
                {/* <Route path="/add-wine-batch" element={<AddWineBatch />} /> */}
                <Route path="/cellar" element={<WineList />} />
                <Route path="/personal-sommelier" element={<WineRecommendations />} />
                <Route path="/cellar/:id" element={<WineDetail />} />
                <Route path="/cellar_orig/:id" element={<WineDetailOrig />} />
                <Route path="/tasting/:id" element={<TastingPage />} />
                <Route path="*" element={<Navigate to="" />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/sign-in" />} />
            )}
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

// New Component to handle location tracking
const LocationTracker = ({ loading }) => {
  const location = useLocation();

  useEffect(() => {
    if (!loading) { // Ensure we are not logging during loading state
      logEvent(analytics, 'page_view', {
        page_path: location.pathname,
      });
    }
  }, [location, loading]); // Added loading to dependencies

  return null; // This component doesn't render anything
};

export default App;
