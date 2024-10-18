import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

import {
  Typography,
  Snackbar,
  Alert,
  Grid,
  Button,
  Box,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import '../styles/WineList.css'; // Ensure any custom styles are still applied
import WineListFilters from '../components/WineListFilters';
import WineListSorting from '../components/WineListSorting';
import CellarStatistics from '../components/CellarStatistics';
import SellWineForm from '../components/SellWineForm';
import { WineCardDesktop, WineCardMobile } from '../components/WineCard';

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
  const [selectedWine, setSelectedWine] = useState(null);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState();
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          setToken(token);
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-wine-data`, {
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/delete-wine/${id}`, {
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
      window.location.reload()
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
    )

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

  // Sell wine
  const handleOpen = (wine) => {
    setLoading(true);
    setSelectedWine(wine);

    // Simulate loading with a timeout
    setTimeout(() => {
      setLoading(false);
      setOpen(true); // Open modal after loading
    }, 100); // Simulated delay for loading
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedWine(null);
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
                {isMobile ? <WineCardMobile wine={wine} /> : <WineCardDesktop wine={wine} />}
                <Box display="flex" justifyContent="space-between" mt="auto" flexWrap="wrap">
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleDelete(wine.id)}
                    sx={{ flex: '1'}} // Margin for spacing
                  >
                    Remove
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => handleOpen(wine)}
                    sx={{ flex: '1', marginRight:1, marginLeft:1 }} // Make sure this button also flexes
                  >
                    Sell
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`/cellar/${wine.id}`)} // Use navigate to go to the wine details
                    sx={{ flex: '1' }}
                  >
                    View
                  </Button>
                </Box>

              </Box>
            </Grid>
          ))
        ) : (
          <>
            {loading ? (
              <>
                Loading...
                <CircularProgress size={24} sx={{ ml: 2 }} />
              </>
            ) : (
              'No wines found...'
            )}</>
        )}
      </Grid>

      {/* Dialog for Sell Form */}
      {selectedWine && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{selectedWine.name}</DialogTitle>
          <DialogContent>
            <SellWineForm
              wineId={selectedWine.id}
              wine={selectedWine}
              token={token}
              setWines={setWines}
              setFilteredWines={setFilteredWines}
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>
      )}
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
