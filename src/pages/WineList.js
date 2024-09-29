import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

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
import WineData from '../components/WineData';
import ForSaleLabel from '../components/ForSaleLabel';

const WineList = () => {
  const [wines, setWines] = useState([]);
  const [filteredWines, setFilteredWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [sortCriteria, setSortCriteria] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    colours: ['Red', 'White', 'Rosé', 'Green', 'Orange', 'Sparkling'],
    grapes: [
      "Cabernet Sauvignon",
      "Merlot",
      "Pinot Noir",
      "Syrah (Shiraz)",
      "Zinfandel",
      "Chardonnay",
      "Sauvignon Blanc",
      "Riesling",
      "Malbec",
      "Tempranillo",
      "Grenache",
      "Cabernet Franc",
      "Sangiovese",
      "Mourvèdre",
      "Viognier",
      "Pinot Grigio (Pinot Gris)",
      "Semillon",
      "Nebbiolo",
      "Barbera",
      "Touriga Nacional",
      "Petit Verdot",
      "Chenin Blanc",
      "Garganega",
      "Grüner Veltliner",
      "Fiano",
      "Albariño",
      "Vermentino",
      "Nero d'Avola",
      "Carignan",
      "Dolcetto",
      "Aglianico",
      "Carmenère",
      "Primitivo",
      "Moscato",
      "Torrontés",
      "Saint Laurent",
      "Tannat",
      "Cinsault"
    ],
    vintages: [],
    names: [],
    datesAdded: [],
    statuses: ['in_cellar', 'consumed', "for_sale"],
    countries: [],
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

          const distinctDateAdded = [...new Set(fetchedWines.map(wine => wine.dateAdded))];
          setFilters(prevFilters => ({
            ...prevFilters,
            datesAdded: distinctDateAdded.sort(),
          }));

          const distinctCountry = [...new Set(fetchedWines.map(wine => wine.country))];
          setFilters(prevFilters => ({
            ...prevFilters,
            countries: distinctCountry.sort(),
          }));

          const distinctName = [...new Set(fetchedWines.map(wine => wine.name))];
          setFilters(prevFilters => ({
            ...prevFilters,
            names: distinctName.sort(),
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

    const confirmed = window.confirm("Are you sure you want to remove this wine from your cellar?");
    if (!confirmed) return; // Exit if the user cancels


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
      setSnackbarMessage('Wine removed successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting wine:', error);
      setSnackbarMessage('Error deleting wine. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
      (!newFilters.dateAdded.length || newFilters.dateAdded.includes(wine.dateAdded)) &&
      (!newFilters.country.length || newFilters.country.includes(wine.country)) &&
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
      } else if (sortCriteria === 'name') {
        comparison = a.name.localeCompare(b.name);
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

  const handleSellWine = async (wineId) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${backendURL}/update-wine-data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: wineId,
          wineData: { status: 'for_sale' }, // Set status to 'for_sale'
        }),
      });

      if (response.ok) {
        const updatedWine = await response.json();
        // Update local state to reflect the updated wine data
        setWines(prevWines => prevWines.map(wine =>
          wine.id === wineId ? updatedWine.data : wine
        ));
        setFilteredWines(prevFilteredWines => prevFilteredWines.map(wine =>
          wine.id === wineId ? updatedWine.data : wine
        ));
        setSnackbarMessage('Wine marked for sale successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        throw new Error('Error updating wine data');
      }
    } catch (error) {
      console.error('Error updating wine status:', error);
      setSnackbarMessage('Error marking wine for sale. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!user) {
    return <Typography>Please log in to see your wine cellar.</Typography>;
  }

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
            <Grid item xs={12} sm={6} md={3} key={wine.id}>
              <Box
                border={0}
                borderRadius={2}
                overflow="hidden"
                boxShadow={3}
                p={2}
                sx={{
                  height: '100%', // Fixed height for consistency
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
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
                      {!wine.drinkingWindow ? (
                        <AgeBadge vintage={wine.vintage} round={true} />
                      ) : (
                        <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} drinkingWindow={wine.drinkingWindow} round={true} />
                      )}
                    </Box>
                    <Box
                      position="absolute"
                      bottom={20} // Adjust this value to position the badge vertically
                      right={10} // Adjust this value to position the badge horizontally
                      zIndex={1} // Ensure the badge appears above the image
                      sx={{ padding: 0 }}>
                      {wine.status === "for_sale" && (<ForSaleLabel price={wine.price} />)}
                    </Box>
                  </CardMedia>

                </Link>
                <CardContent sx={{
                  padding: 0,
                  margin: 1
                }}>
                  <WineData wine={wine} wineListPage="true" />
                </CardContent>
                <Box display="flex" justifyContent="space-between" mt="auto">
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={6}>
                      <Link to={`/cellar/${wine.id}`} style={{ textDecoration: 'none' }}>
                        <Button variant="contained" color="primary" fullWidth>
                          View Wine
                        </Button>
                      </Link>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleDelete(wine.id)}
                        fullWidth
                      >
                        Remove
                      </Button>
                    </Grid>
                    {/* Add Sell This Bottle Button */}
                    <Grid item xs={12} sm={12}>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => navigate(`/for-sale/${wine.id}`)}  // Change this line to use navigate
                        fullWidth
                      >
                        Sell This Bottle
                      </Button>
                    </Grid>
                  </Grid>
                </Box>


              </Box>
            </Grid>
          ))
        ) : (
          <Typography>
            No wines found or loading...
            <CircularProgress />
          </Typography>
        )}
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WineList;
