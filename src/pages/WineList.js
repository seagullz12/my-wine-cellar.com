import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import '../styles/WineList.css';
import AgeBadge from '../components/AgeBadge';
import PeakMaturityBadge from '../components/PeakMaturityBadge';
import WineFilter from '../components/WineFilter'; // Importing WineFilter component

const WineList = () => {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [filter, setFilter] = useState(''); // State for filter

  const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';

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

      setWines(wines.filter((wine) => wine.id !== id));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting wine:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // Filter the wines based on the selected filter
  const filteredWines = wines.filter((wine) => {
    if (!filter) return true; // Show all wines if no filter is selected
    return wine.status === filter; // Filter by selected status
  });

  if (loading) {
    return <p>Loading your wine cellar...</p>;
  }

  if (!user) {
    return <p>Please log in to see your wine cellar.</p>;
  }

  return (
    <div className="wine-list-container">
      {/* Wine Filter Component */}
      <WineFilter filter={filter} onFilterChange={handleFilterChange} />

      <div className="wine-grid">
        {filteredWines.length > 0 ? (
          filteredWines.map((wine, index) => (
            <div className="wine-card" key={index}>
              <div className="image-container">
                {wine.image?.desktop && (
                  <Link to={`/cellar/${wine.id}`}>
                    <CardMedia>
                      <div className="wine-image-container">
                        <img
                          src={wine.image.desktop}
                          srcSet={`${wine.image.mobile} 600w, ${wine.image.desktop} 1200w`}
                          sizes="(max-width: 600px) 100vw, 1200px"
                          alt={wine.name}
                          className="wine-image"
                        />
                        {!wine.peakMaturity ? (
                          <AgeBadge vintage={wine.vintage} round={true} />
                        ) : (
                          <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} round={true} />
                        )}
                      </div>
                    </CardMedia>
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
                <Typography variant="body2" color="textSecondary">
                  <strong>Quality Classification:</strong> {wine.classification}
                </Typography>
              </CardContent>

              <div className="buttons-container">
                <Link to={`/cellar/${wine.id}`} className="view-button">
                  View Wine
                </Link>
                <button className="delete-button" onClick={() => handleDelete(wine.id)}>
                  Remove from Cellar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No wines found.</p>
        )}
      </div>

      {/* Snackbar for success notification */}
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
