import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import '../styles/WineDetail.css'; // Import the CSS file

const WineDetail = () => {
  const { id } = useParams(); // Get the ID from the URL
  const [user, setUser] = useState(null);
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

//  const backendURL = 'http://192.168.2.9:8080'; // Ensure this matches your actual backend URL
  const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchWineData = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await fetch(`${backendURL}/get-wine-data/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Fetched wine data:', result); // Debugging: log the result

            if (result && result.wine) {
              setWine(result.wine); // Directly set the wine object
            } else {
              console.error('Unexpected response format:', result); // Debugging: log unexpected format
              setError('Unexpected response format');
            }
          } else {
            console.error('Error fetching wine data:', response.statusText); // Debugging: log status text
            setError('Error fetching wine data');
          }
        } catch (error) {
          console.error('An error occurred while fetching wine data:', error); // Debugging: log the error
          setError('An error occurred while fetching wine data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWineData();
  }, [id, user]); // Added 'user' to dependency array to refetch if user changes

  if (loading) return <p className="wine-detail-loading">Loading...</p>;
  if (error) return <p className="wine-detail-error">{error}</p>;

  return (
    <div className="wine-detail-container">
      {wine ? (
        <div>
          <div className="wine-detail-header">
            <h2>{wine.name}</h2>
          </div>
          {wine['Image URL'] && (
            <img
              src={wine['Image URL']}
              alt={wine.name}
              className="wine-detail-image"
            />
          )}
          <div className="wine-detail-info">
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
      ) : (
        <p>Wine data not found</p>
      )}
    </div>
  );
};

export default WineDetail;
