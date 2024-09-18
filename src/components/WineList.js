import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar'; // Snackbar for user notification
import Alert from '@mui/material/Alert'; // Alert component for showing success message
import '../styles/WineList.css'; // Ensure this file includes the updated CSS

const WineList = () => {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State to control Snackbar visibility

  const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';
 // const backendURL = 'http://192.168.2.9:8080';

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchWines = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await fetch(`${backendURL}/get-wine-data`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch wine data');
          }

          const data = await response.json();
          setWines(data.wines || []);
        } catch (error) {
          console.error('Error fetching wine data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWines();
  }, [user]);

  const handleDelete = async (id) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${backendURL}/delete-wine/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete wine');
      }

      // Remove the wine from the state after successful deletion
      setWines(wines.filter(wine => wine.id !== id));

      // Show a success notification
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting wine:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return <p>Loading your wine cellar...</p>;
  }

  if (!user) {
    return <p>Please log in to see your wine cellar.</p>;
  }

  return (
    <div className="wine-list-container">
      <div className="wine-grid">
        {wines.length > 0 ? (
          wines.map((wine, index) => (
            <div className="wine-card" key={index}>
              <div className="image-container">
                {wine['Image URL'] && (
                  <Link to={`/cellar/${wine.id}`}>
                  <CardMedia
                    component="img"
                    image={wine['Image URL']}
                    alt={wine.name}
                    className="wine-image" // Ensure this CSS class is correctly defined
                  />
                </Link>
                )}
              </div>
              <CardContent className="wine-info">
                <Typography variant="h6" component="div" className="wine-name">
                  {wine.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Grape:</strong> {wine.grape}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Vintage:</strong> {wine.vintage}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Region:</strong> {wine.region}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Producer:</strong> {wine.producer}
                </Typography>
              </CardContent>

              {/* Buttons */}
              <div className="buttons-container">
                <Link to={`/cellar/${wine.id}`} className="view-button">
                  View Wine
                </Link>
                <button 
                  className="delete-button" 
                  onClick={() => handleDelete(wine.id)}
                >
                  Remove from Cellar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No wines found.</p>
        )}
      </div>

      {/* Snackbar for showing success notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Deleted from Cellar. Hope you enjoyed the wine!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default WineList;
