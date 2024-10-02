import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
//import '../styles/WineList.css';
import AgeBadge from '../components/AgeBadge';
import PeakMaturityBadge from '../components/PeakMaturityBadge';
import WineListFilters from '../components/WineListFilters'; // Importing WineFilter component
import WineListSorting from '../components/WineListSorting';
import CellarStatistics from '../components/CellarStatistics';

const WineList = () => {
  const [wines, setWines] = useState([]);
  const [filteredWines, setFilteredWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('vintage'); // Default sorting by vintage
  const [sortOrder, setSortOrder] = useState('asc'); // Default sort order
  
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

          // // Get filter values from firestore database
          // const distinctGrapes = [...new Set(fetchedWines.map(wine => wine.grape))];
          // setFilters(prevFilters => ({
          //   ...prevFilters,
          //   grapes: distinctGrapes,  // Update grapes in filters
          // }));
          const distinctVintages = [...new Set(fetchedWines.map(wine => wine.vintage))];
          setFilters(prevFilters => ({
            ...prevFilters,
            vintages: distinctVintages.sort(),  // Update vintages in filters
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
    //  (!newFilters.colour.length || newFilters.colour.includes(wine.colour)) &&
      (!newFilters.colour.length || newFilters.colour.some(colour => wine.colour.toLowerCase().includes(colour.toLowerCase()))) && // contains
    //  (!newFilters.grape.length || newFilters.grape.includes(wine.grape)) && // exact match
      (!newFilters.grape.length || newFilters.grape.some(grape => wine.grape.toLowerCase().includes(grape.toLowerCase()))) && // contains
      (!newFilters.vintage.length || newFilters.vintage.includes(wine.vintage)) &&
      (!newFilters.status.length || newFilters.status.includes(wine.status))
    );

    // Sort the filtered wines based on the selected criteria
    const sortedFilteredWines = sortWines(filtered);
    setFilteredWines(sortedFilteredWines);
  };

  const handleResetFilters = () => {
    setFilteredWines(wines);
  };

  // Function to sort wines
  const sortWines = (winesArray) => {
    return winesArray.sort((a, b) => {
      let comparison = 0;
      if (sortCriteria === 'vintage') {
        comparison = a.vintage.localeCompare(b.vintage);
      } else if (sortCriteria === 'addedDate') {
        comparison = new Date(a.addedDate) - new Date(b.addedDate); // Assuming dateAdded is a Date string
      }

      return sortOrder === 'asc' ? comparison : comparison * -1; // Adjust for ascending/descending
    });
  };

  // Function to handle sort criteria change
  const handleSortChange = (event) => {
    const { value } = event.target;
    setSortCriteria(value);
    const sortedWines = sortWines(filteredWines);
    setFilteredWines(sortedWines);
  };

  // Function to handle sort order change
  const handleSortOrderChange = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    const sortedWines = sortWines(filteredWines);
    setFilteredWines(sortedWines);
  };

if (loading) {
  return <p>Loading your wine cellar...</p>;
}

if (!user) {
  return <p>Please log in to see your wine cellar.</p>;
}

  return (
    <div className="wine-list-container">
      {/* Wine Statistics Component */}
      <CellarStatistics wines={filteredWines.length > 0 ? filteredWines : wines} />

      <div className='filter-sort-container'>
      {/* Wine Filter Component */}
      <WineListFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onResetFilters={handleResetFilters} 
      />
       {/* Wine Sorting Component */}
       <WineListSorting 
        sortCriteria={sortCriteria} 
        sortOrder={sortOrder} 
        onSortChange={handleSortChange} 
        onSortOrderChange={handleSortOrderChange} 
      /></div>
      <div className="wine-grid">
        {filteredWines.length > 0 ? (
          filteredWines.map((wine, index) => (
            <div className="wine-card" key={index}>
              <div className="image-container">
                {(wine.images.front.desktop || wine.images.back.desktop) && (
                  <Link to={`/cellar/${wine.id}`}>
                    <CardMedia>
                      <div className="wine-image-container">
                      <img
                        src={wine.images?.front?.desktop ? wine.images.front.desktop : wine.images?.back?.desktop}
                        srcSet={`${wine.images?.front?.mobile ? wine.images.front.mobile : wine.images?.back?.mobile} 600w, 
                                ${wine.images?.front?.desktop ? wine.images.front.desktop : wine.images?.back?.desktop} 1200w`}
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
