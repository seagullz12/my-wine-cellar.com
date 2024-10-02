import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  Button,
  TextField,
  CircularProgress,
  Typography,
  Container,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Grid,
  Box,
  Link, 
} from '@mui/material';
import WineDataRecommendations from '../components/WineDataRecommendations';

//const backendURL = 'http://192.168.2.9:8080';
const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';


const WineRecommendation = () => {
  const [food, setFood] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get Firebase Auth token
  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    return user ? user.getIdToken() : null;
  };

  // Fetch wine recommendations from the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('User not authenticated.');

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/recommend-wine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ food }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations from the server.');
      }

      const data = await response.json();
      setRecommendations(data.recommendations); // Store recommendations in state
      console.log(data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, px: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Hi! I am your personal sommelier.
      </Typography>
      <Typography variant="body1" align="center" gutterBottom>
        Enter your food, and I'll find the best wine pairing from your cellar:
      </Typography>

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Enter your dish"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              required
              variant="outlined"
              sx={{ backgroundColor: '#fff' }} // White background for input
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ height: '100%' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Find Best Pairings'}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Loading State */}
      {loading && (
        <Typography align="center" sx={{ mt: 2 }}>
          Loading recommendations...
        </Typography>
      )}

      {/* Error State */}
      {error && (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}

      {/* Recommendations */}
      {recommendations && (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {recommendations.map((recommendation) => {
            const { id, recommendation_rank, explanation, wineDetails } = recommendation;

            return (
              <Grid item xs={12} sm={6} key={id}>
                <Card 
                  sx={{ 
                    boxShadow: 3, 
                    mb: 0, 
                    display: 'flex', // Use flexbox
                    flexDirection: 'column', // Ensure vertical stacking
                    height: '100%', // Make sure the card stretches
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}> {/* Allow content to grow */}
                    <Box sx={{ p: 2 }}>
                    <Typography variant="h6" align="left" gutterBottom>
                        #{recommendation_rank}: {wineDetails.name}
                      </Typography>

                      {/* Top Half: Two Columns */}
                      <Grid container spacing={2}>
                        {/* Left Column: Wine Image */}
                        <Grid item xs={6} sm={4}>
                        <Link 
                            href={`/#/cellar/${id}`} // Link to the wine cellar details page
                            target="_blank"
                            rel="noreferrer"
                            sx={{ display: 'block', textDecoration: 'none' }} // Make the link block-level
                          >
                          <Box
                            component="img"
                            src={wineDetails.images.front.desktop}
                            alt={wineDetails.name}
                            
                            sx={{
                              width: '100%',
                              height: 'auto',
                              borderRadius: '8px',
                              transition: 'transform 0.2s', // Animation effect on hover
                              '&:hover': {
                                transform: 'scale(1.05)', // Scale effect on hover
                              },
                            }}
                          />
                          </Link>
                        </Grid>

                        {/* Right Column: Wine Details */}
                        <Grid item xs={6} sm={8}>
                          <WineDataRecommendations wine={wineDetails} />
                          <Link 
                      href={`/#/cellar/${id}`} // Link to the wine details page
                      target="_blank"
                      rel="noreferrer"
                      sx={{ mt:1, ml: 4, display: 'block', textDecoration: 'none', color: 'primary.main' }} // Styles for the link
                    >
                      View wine details
                    </Link>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                  {/* Bottom Half: Explanation and Link */}
                  <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="body1">
                      <strong>Why it pairs so well:</strong> {explanation}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default WineRecommendation;
