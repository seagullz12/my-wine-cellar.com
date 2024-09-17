import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase Authentication functions
import './WineList.css'; // Ensure CSS file is correctly imported

const WineList = () => {
  const [wines, setWines] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  // const backendURL = 'https://wine-scanner-backend-44824993784.europe-west1.run.app'; // Replace with your production URL
  const backendURL = 'http://192.168.2.9:8080'; // Replace with your development URL

  useEffect(() => {
    // Check for authenticated user
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
          const token = await user.getIdToken(); // Get the ID token from Firebase Authentication
          const response = await fetch(`${backendURL}/get-wine-data`, {
            headers: {
              'Authorization': `Bearer ${token}` // Include the token in the request headers
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch wine data');
          }

          const data = await response.json();
          console.log('Fetched wine data:', data); // Log the fetched data
          setWines(data.wines || []); // Ensure wines is set to an empty array if undefined
        } catch (error) {
          console.error('Error fetching wine data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('User is not logged in');
        setLoading(false);
      }
    };

    fetchWines();
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
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
              {wine['Image URL'] && <img src={wine['Image URL']} alt={wine.name} className="wine-image" />}
              <div className="wine-info">
                <h2 className="wine-name">{wine.name}</h2>
                <p><strong>Grape:</strong> {wine.grape}</p>
                <p><strong>Vintage:</strong> {wine.vintage}</p>
                <p><strong>Region:</strong> {wine.region}</p>
                <p><strong>Producer:</strong> {wine.producer}</p>
                <p><strong>Alcohol Content:</strong> {wine.alcoholContent}</p>
                <p><strong>Colour:</strong> {wine.colour}</p>
                <p><strong>Nose:</strong> {wine.nose}</p>
                <p><strong>Palate:</strong> {wine.palate}</p>
                <p><strong>Pairing:</strong> {wine.pairing}</p>
              </div>
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
