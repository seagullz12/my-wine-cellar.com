// src/components/api/wines.js
export const fetchUserWines = async (token) => {
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

    if (response.status === 404) {
      // Return an empty array if the wines are not found
      return { wines: [] }; // Handle the case where no wines are found
    }

    // Check for other response errors
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error('Failed to fetch wines data:', response.status, errorMessage);
      throw new Error('Failed to fetch wine data');
    }

    const data = await response.json();
    return { wines: data.wines || [] }; // Ensure wines is always an array
  } catch (error) {
    console.error('Error fetching wine data:', error);
    throw error; // Re-throw error to be handled in component
  }
};
