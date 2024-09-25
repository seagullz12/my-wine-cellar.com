import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Box, Grid, Card, CardMedia, CardContent, Button, Typography } from '@mui/material';
// import Header from '../components/Header'; // Import the new Header component
import personalSommelier from '../assets/images/personalSommelier.webp';
import manageWineCollection from '../assets/images/manageWineCollection.webp';
import joinUs from '../assets/images/joinUs.webp';
import addWines from '../assets/images/AddWines.webp';
import HeroBanner from '../components/HeroBanner';

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <Box sx={{ padding: 2, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <HeroBanner />
      <Grid item xs={12} sx={{ textAlign: 'left', marginBottom: 2, marginTop: 2 }}>
        {!isLoggedIn && (
        <Typography variant="body2">
          Already have an account?{' '}
          <Link to="/sign-in" style={{ color: 'primary.main', textDecoration: 'underline' }}>
            Sign In
          </Link>
        </Typography>)}
      </Grid>
      <Grid container spacing={2} justifyContent="center">
        {!isLoggedIn && (
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image={joinUs}
                alt="Join Us"
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" align="center">Join Us</Typography>
                <Box sx={{ borderBottom: '2px solid', marginBottom: 1 }} />
                <Typography variant="body2" align="center">
                  Sign up today and start your wine journey.
                </Typography>
                <Button
                  component={Link}
                  to="/sign-up"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: 1 }}
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
              <CardMedia
                component="img"
                height="140"
                image={addWines}
                alt="Add Wine"
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" align="center">Add New Wines</Typography>
                <Box sx={{ borderBottom: '2px solid', marginBottom: 1 }} />
                <Typography variant="body2" align="center">
                  Expand your collection by adding new wines to your cellar.
                </Typography>
                <Button
                  component={Link}
                  to="/add-wine"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: 1 }}
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
              height="140"
              image={manageWineCollection}
              alt="Manage your Wine Cellar"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" align="center">Manage your Wine Cellar</Typography>
              <Box sx={{ borderBottom: '2px solid', marginBottom: 1 }} />
              <Typography variant="body2" align="center">
                Simplify your wine collection management and enjoyment.
              </Typography>
              <Button
                component={Link}
                to={isLoggedIn ? "/cellar" : "/sign-up"}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ marginTop: 1 }}
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
              height="140"
              image={personalSommelier}
              alt="Personal Sommelier"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" align="center">Personal Sommelier</Typography>
              <Box sx={{ borderBottom: '2px solid', marginBottom: 1 }} />
              <Typography variant="body2" align="center">
                Get personalized recommendations and enhance your wine-tasting experience with tailored suggestions.
              </Typography>
              <Button
                component={Link}
                to={isLoggedIn ? "/personal-sommelier" : "/sign-up"}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ marginTop: 1 }}
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
