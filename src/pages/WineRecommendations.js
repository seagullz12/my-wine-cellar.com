import React, { useState } from 'react';
import { getAuth } from 'firebase/auth'; // Firebase authentication
import { 
  Button, 
  TextField, 
  CircularProgress, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Link, 
  Snackbar, 
  Alert, 
  Grid 
} from '@mui/material';

const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app'; // prod

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

  // Fetch wine recommendations from backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('User not authenticated.');

      const response = await fetch(`${backendURL}/recommend-wine`, {
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
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
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
              {loading ? <CircularProgress size={24} /> : 'Get Recommendations'}
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
        <Grid container spacing={2} sx={{ mt: 3 }}>
          {['best', 'second_best', 'third_best'].map((rank) => (
            <Grid item xs={12} sm={4} key={rank}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {rank.replace('_', ' ')} Pairing
                  </Typography>
                  <Typography variant="body1">
                    <strong>Name:</strong>{' '}
                    <Link
                      href={"https://www.my-wine-cellar.com/#" + recommendations[`${rank}_pairing_link`]}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {recommendations[`${rank}_pairing_name`]}
                    </Link>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Explanation:</strong> {recommendations[`${rank}_pairing_explanation`]}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default WineRecommendation;
