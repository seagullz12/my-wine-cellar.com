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

// Fetch a specific wine by its ID
export const fetchUserWineById = async (token, wineId) => {
  if (!token || !wineId) {
    throw new Error('Token and wineId are required to fetch wine data');
  }

  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-wine-data?id=${wineId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null; // Handle the case where the wine is not found
    }

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error('Failed to fetch wine data:', response.status, errorMessage);
      throw new Error('Failed to fetch wine data');
    }

    const data = await response.json();
    return data.wine || null; // Return the wine data or null if not found
  } catch (error) {
    console.error('Error fetching wine data:', error);
    throw error; // Re-throw error to be handled in component
  }
};
