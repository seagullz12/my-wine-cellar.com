import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useMediaQuery } from '@mui/material'; // Import useMediaQuery

// Import pages
import Home from './pages/Home';
import WineList from './pages/WineList.js';
import WineRecommendations from './pages/WineRecommendations';
import WineDetail from './pages/WineDetail';
import NavBar from './components/NavBar'; 
import SignIn from './pages/SignIn'; 
import SignUp from './pages/SignUp'; 
import SharedWineDetail from './pages/SharedWineDetail';
import './styles/global.css';
import AddWine from './pages/AddWine';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// MUI styles
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './components/theme.js'; 

// Import Cookie Consent Component
import CookieConsentComponent from './components/CookieConsentComponent';

// SEO
import { Helmet } from 'react-helmet';
import PageTitle from './components/utils/PageTitle.js'; 

// GA4 (analytics)
import ReactGA from 'react-ga4';
import PasswordReset from './pages/PasswordReset.js';
import Profile from './pages/Profile.js';
import Marketplace from './pages/Marketplace.js';
import ConfirmSalePage from './pages/ConfirmSale.js';
import SellerDashboard from './pages/SellerDashboard.js';
import SellerDashboardV2 from './pages/SellerDashboardV2.js';
import ManageListings from './pages/ManageListings.js';
import BottomNav from './components/BottomNav.js';

const TRACKING_ID = 'G-HZJRPGMJVT'; 

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Use useMediaQuery to check if the screen size is mobile
  const isMobile = useMediaQuery('(max-width:600px)'); // Adjust the max-width as necessary

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <PageTitle />
        <TrackPageView />
        <div className="App">
          <Helmet>
            <title>My Wine Cellar - Manage, Taste, and Treasure</title>
            <meta name="description" content="Explore and manage your wine collection with My Wine Cellar." />
            <meta name="keywords" content="My Wine Cellar, wine management, wine collection app, digital wine cellar, wine tasting, wine recommendations, track wine inventory, wine lovers" />
          </Helmet>
          
          {/* Render BottomNav only on mobile devices */}
          {isMobile && <BottomNav />}

          <NavBar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/shared/:token" element={<SharedWineDetail />} /> 

            {/* Protected Routes */}
            {user ? (
              <>
                <Route path="/add-wine" element={<AddWine />} />
                <Route path="/cellar" element={<WineList />} />
                <Route path="/personal-sommelier" element={<WineRecommendations />} />
                <Route path="/cellar/:id" element={<WineDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/seller/dashboard" element={<SellerDashboard user={user} />} />
                <Route path="/seller/confirm-sale/:requestId" element={<ConfirmSalePage user={user} />} />
                <Route path="/my-listings" element={<ManageListings user={user} />} />
                <Route path="*" element={<Navigate to="" />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/sign-in" />} />
            )}
          </Routes>
          {/* Include Cookie Consent Component */}
          <CookieConsentComponent />
        </div>
      </Router>
    </ThemeProvider>
  );
};

// Component to track page views on route change
const TrackPageView = () => {
  const location = useLocation();

  useEffect(() => {
    // Log pageview whenever the URL changes
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.hash });
  }, [location]);

  return null;
};

export default App;
