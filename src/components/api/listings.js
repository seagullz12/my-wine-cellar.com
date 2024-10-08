// components/api/listings.js

export const addListing = async (wineId, wineDetails, sellerDetails, token) => {
    if (!token) throw new Error('Token not available.');
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-listing`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                wineId: wineId || null, 
                ...wineDetails,
                ...sellerDetails
            }),
        });

        // Handle non-2xx HTTP response status
        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Error processing wine data');
        }

        // Return the processed data if the response is successful
        const { data } = await response.json();
        return data;
    } catch (error) {
        // Provide a more detailed error message if something goes wrong
        throw new Error(`Failed to list the wine: ${error.message}`);
    }
};

export const updateListing = async (listingId, wineDetails, token) => {
  try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update-listing/${listingId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, // Include the token for authentication
          },
          body: JSON.stringify(wineDetails), // Send the updated wine details
      });

      if (!response.ok) {
          throw new Error('Failed to update listing.');
      }

      const data = await response.json();
      return data; // Return the updated listing data or success message
  } catch (error) {
      console.error(error);
      throw error; // Rethrow the error to be handled by the calling component
  }
};

export const updateListingStatus = async (listingId, status, token) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update-listing-status/${listingId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            throw new Error('Failed to update listing status.');
        }

        return response.json();
    } catch (error) {
        console.error('Error updating listing status:', error);
        throw error;
    }
};

/**
 * Delete a specific listing by its ID.
 * @param {string} listingId - The ID of the listing to delete.
 * @param {string} token - The user's auth token.
 * @returns {Promise<void>} - Resolves when the listing is deleted, rejects on error.
 */
export const deleteListing = async (listingId, token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/delete-listing/${listingId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete the listing.');
      }
  
      return response.json(); // Optionally return any success message from the API
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  };