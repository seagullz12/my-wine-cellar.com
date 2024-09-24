import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import {
  CardContent,
  CardMedia,
  Typography,
  Snackbar,
  Alert,
  Grid,
  Button,
  Box,
  CircularProgress,
  Container,
} from '@mui/material';
import '../styles/WineList.css'; // Ensure any custom styles are still applied
import AgeBadge from '../components/AgeBadge';
import PeakMaturityBadge from '../components/PeakMaturityBadge';
import WineListFilters from '../components/WineListFilters';
import WineListSorting from '../components/WineListSorting';
import CellarStatistics from '../components/CellarStatistics';

const WineList = () => {
  const [wines, setWines] = useState([]);
  const [filteredWines, setFilteredWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('vintage');
  const [sortOrder, setSortOrder] = useState('asc');

  const [filters, setFilters] = useState({
    colours: ['Red', 'White', 'Rosé', 'Green', 'Orange', 'Sparkling'],
    grapes: [
      // ... List of grapes
    ],
    vintages: [],
    statuses: ['in_cellar', 'consumed'],
  });

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
          const fetchedWines = data.wines || [];
          setWines(fetchedWines);
          setFilteredWines(fetchedWines);

          const distinctVintages = [...new Set(fetchedWines.map(wine => wine.vintage))];
          setFilters(prevFilters => ({
            ...prevFilters,
            vintages: distinctVintages.sort(),
          }));

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

  const handleFilterChange = (newFilters) => {
    const filtered = wines.filter(wine =>
      (!newFilters.colour.length || newFilters.colour.some(colour => wine.colour.toLowerCase().includes(colour.toLowerCase()))) &&
      (!newFilters.grape.length || newFilters.grape.some(grape => wine.grape.toLowerCase().includes(grape.toLowerCase()))) &&
      (!newFilters.vintage.length || newFilters.vintage.includes(wine.vintage)) &&
      (!newFilters.status.length || newFilters.status.includes(wine.status))
    );

    const sortedFilteredWines = sortWines(filtered);
    setFilteredWines(sortedFilteredWines);
  };

  const handleResetFilters = () => {
    setFilteredWines(wines);
  };

  const sortWines = (winesArray) => {
    return winesArray.sort((a, b) => {
      let comparison = 0;
      if (sortCriteria === 'vintage') {
        comparison = a.vintage.localeCompare(b.vintage);
      } else if (sortCriteria === 'addedDate') {
        comparison = new Date(a.addedDate) - new Date(b.addedDate);
      }

      return sortOrder === 'asc' ? comparison : comparison * -1;
    });
  };

  const handleSortChange = (event) => {
    const { value } = event.target;
    setSortCriteria(value);
    const sortedWines = sortWines(filteredWines);
    setFilteredWines(sortedWines);
  };

  const handleSortOrderChange = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    const sortedWines = sortWines(filteredWines);
    setFilteredWines(sortedWines);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!user) {
    return <Typography>Please log in to see your wine cellar.</Typography>;
  }
const spacingValue = 1.5;
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <CellarStatistics wines={filteredWines.length > 0 ? filteredWines : wines} />

      <Box my={2}>
        <WineListFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
        <WineListSorting
          sortCriteria={sortCriteria}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onSortOrderChange={handleSortOrderChange}
        />
      </Box>

      <Grid container spacing={2}>
        {filteredWines.length > 0 ? (
          filteredWines.map((wine) => (
            <Grid item xs={12} sm={6} md={4} key={wine.id}>
              <Box border={0} borderRadius={2} overflow="hidden" boxShadow={3} p={2}>
                <Link to={`/cellar/${wine.id}`}>
                  <CardMedia sx={{ position: 'relative' }}>
                    {/* The Wine Image */}
                    <img
                      src={wine.images?.front?.desktop || wine.images?.back?.desktop}
                      srcSet={`${wine.images?.front?.mobile || wine.images?.back?.mobile} 600w,
            ${wine.images?.front?.desktop || wine.images?.back?.desktop} 1200w`}
                      sizes="(max-width: 600px) 100vw, 1200px"
                      alt={wine.name}
                      className="wine-image"
                      style={{ width: '100%', height: 'auto', borderRadius: '8px' }} // Optional border-radius
                    />

                    {/* Overlay PeakMaturityBadge on the image */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16, // Adjust for vertical position
                        left: 16, // Adjust for horizontal position
                        borderRadius: '8%', // Make it rounded
                      }}
                    >
                      {!wine.peakMaturity ? (
                        <AgeBadge vintage={wine.vintage} round={true} />
                      ) : (
                        <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} round={true} />
                      )}
                    </Box>
                  </CardMedia>

                </Link>
                <CardContent sx={{ 
                    padding: 2,
                    margin: 1
                    }}>
                     <Typography sx={{ mb: spacingValue }}><strong>Name:</strong> {wine.name}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Grape:</strong> {wine.grape}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Vintage:</strong> {wine.vintage}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Region:</strong> {wine.region}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Producer:</strong> {wine.producer}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Colour:</strong> {wine.colour}</Typography>
                     <Typography sx={{ mb: 0 }}><strong>Peak Maturity:</strong> {wine.peakMaturity} years after harvest</Typography>
                </CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Link to={`/cellar/${wine.id}`}>
                    <Button variant="contained" color="primary">
                      View Wine
                    </Button>
                  </Link>
                  <Button variant="outlined" color="primary" onClick={() => handleDelete(wine.id)}>
                    Remove
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))
        ) : (
          <Typography>No wines found.</Typography>
        )}
      </Grid>

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
    </Container>
  );
};

export default WineList;
