// useFetchWineDataById.js
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

const backendURL = 'http://192.168.2.9:8080'; // Update this to your actual backend URL

const useFetchWineDataById = (wineId) => {
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    return user ? user.getIdToken() : null;
  };

  useEffect(() => {
    const fetchWineData = async () => {
      const token = await getToken();
      const user = getAuth().currentUser; // Ensure you have user object available

      if (user && wineId) {
        setLoading(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-wine-data?id=${wineId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            setWine(result.wine); // Store the fetched wine data
          } else {
            setError('Error fetching wine data');
          }
        } catch (error) {
          setError('An error occurred while fetching wine data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (wineId) { // Only fetch if wineId is provided
      fetchWineData();
    }
  }, [wineId]); // Run the effect whenever wineId changes

  return { wine, loading, error }; // Return only the wine, loading state, and error
};

export default useFetchWineDataById;
