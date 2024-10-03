// src/components/api/wines.js

export const fetchUserWines = async (token) => {
  // Check if the token is provided
  if (!token) {
    throw new Error('Token is required to fetch wines data');
  }
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-wine-data`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Check for response status
    if (!response.ok) {
      const errorMessage = await response.text(); // Get the error message from the response
      console.error('Failed to fetch wines data:', response.status, errorMessage);
      throw new Error('Failed to fetch wine data');
    }

    const data = await response.json();
    return data
    
  } catch (error) {
    console.error('Error fetching wine data:', error);
    throw error;
  }
};
