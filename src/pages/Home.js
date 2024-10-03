import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Box, Grid, Card, CardMedia, CardContent, Button, Typography } from '@mui/material';
import personalSommelier from '../assets/images/wine_lover_man.jpg';
import manageWineCollection from '../assets/images/wine_lover_woman2.jpg';
import joinUs from '../assets/images/wine_lover_man2.jpg';
import addWines from '../assets/images/add_wine_woman.jpg';
import HeroBanner from '../components/HeroBanner';
import UserWineCarousel from '../components/UserWineCarousel';
import MarketWineCarousel from '../components/MarketWineCarousel';

// api calls
import { fetchUserProfile } from '../components/api/user';

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [profileData, setProfileData] = useState({ displayName: '', userName: '' });

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  // user profile data api call //
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setToken(token)
          
          const data = await fetchUserProfile(token);

          // Set profile data or handle cases where no data exists
          if (data) {
            setProfileData({
              displayName: data.displayName || '',
              userName: data.userName || '',
            });
          } else {
            setError('No user data found.');
          }
        } catch (error) {
          // Handle specific error scenarios
          console.error('Error fetching profile data:', error);
          setError('Failed to load user profile. Please try again later.');
        }
      } else {
        setError('User not authenticated.');
      }
    };
    fetchProfileData();
  }, [user]);
  // end user profile data api call //

  return (
    <Box sx={{ padding: 2, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <HeroBanner isLoggedIn={isLoggedIn} />
      <Grid item xs={12} sx={{ textAlign: 'left', marginBottom: 2, marginTop: 2 }}>
        {isLoggedIn && (
          <>
            <Typography variant="h5" sx={{ textAlign: "center" }}>
              Welcome back, <strong style={{ color: '#800020' }}>{profileData.userName || profileData.userName || "my friend!"}</strong>!
            </Typography>

            <Box sx={{m:1}}>
            {/* MarketplacePreview component */}
            <MarketWineCarousel sampleSize={6} token={token} />
            </Box>
             {/* UserWineCarousel component */}
             <Box sx={{m:1}}>
              <UserWineCarousel sampleSize={6} token={token} />
            </Box>
          </>
        )}
        {!isLoggedIn && (
          <Typography variant="body2">
            Already have an account?{' '}
            <Link to="/sign-in" style={{ color: 'primary.main', textDecoration: 'underline' }}>
              Sign In
            </Link>
          </Typography>
        )}
      </Grid>
      <Grid container spacing={2} justifyContent="center">
        {!isLoggedIn && (
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardMedia component="img" height="250" image={joinUs} alt="Join Us" />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" align="center">Join Us</Typography>
                <Box sx={{ borderBottom: '2px solid', marginBottom: 1 }} />
                <Typography variant="body2" align="center" sx={{ flexGrow: 1 }}>
                  Sign up today and start your wine journey.
                </Typography>
                <Button
                  component={Link}
                  to="/sign-up"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: 2 }}
                >
                  Sign Up
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
        {isLoggedIn && (
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardMedia component="img" height="250" image={addWines} alt="Add Wine" />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" align="center">Add New Wines</Typography>
                <Box sx={{ borderBottom: '2px solid', marginBottom: 1 }} />
                <Typography variant="body2" align="center" sx={{ flexGrow: 1 }}>
                  Expand your collection by adding new wines to your cellar.
                </Typography>
                <Button
                  component={Link}
                  to="/add-wine"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: 2 }}
                >
                  Add Wine
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardMedia
              component="img"
              height="250"
              image={manageWineCollection}
              alt="Manage your Wine Cellar"
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" align="center">Manage your Wine Cellar</Typography>
              <Box sx={{ borderBottom: '2px solid', marginBottom: 1 }} />
              <Typography variant="body2" align="center" sx={{ flexGrow: 1 }}>
                Simplify your wine collection management and enjoyment.
              </Typography>
              <Button
                component={Link}
                to={isLoggedIn ? "/cellar" : "/sign-up"}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ marginTop: 2 }}
              >
                {isLoggedIn ? "View Cellar" : "Sign Up"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardMedia
              component="img"
              height="250"
              image={personalSommelier}
              alt="Personal Sommelier"
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" align="center">Personal Sommelier</Typography>
              <Box sx={{ borderBottom: '2px solid', marginBottom: 1 }} />
              <Typography variant="body2" align="center" sx={{ flexGrow: 1 }}>
                Get personalized recommendations and enhance your wine-tasting experience with tailored suggestions.
              </Typography>
              <Button
                component={Link}
                to={isLoggedIn ? "/personal-sommelier" : "/sign-up"}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ marginTop: 2 }}
              >
                {isLoggedIn ? "Get wine advice" : "Sign Up"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
