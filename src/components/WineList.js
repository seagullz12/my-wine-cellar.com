import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

// Import your custom CSS
import '../styles/WineList.css';

const WineList = () => {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
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
              {wine['Image URL'] && (
                <Link to={`/cellar/${wine.id}`}>
                  <CardMedia
                    component="img"
                    image={wine['Image URL']}
                    alt={wine.name}
                    className="wine-image"
                  />
                </Link>
              )}
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
                {/* Add a "More Information" link */}
                <Link to={`/cellar/${wine.id}`} className="more-info-link">
                  More Information
                </Link>
              </CardContent>
            </div>
          ))
        ) : (
          <p>No wines found.</p>
        )}
      </div>
    </div>
  );
};

export default WineList;
