// /components/api/marketplace.js

export const fetchMarketplaceListings = async (token) => {
    // Check if the token is provided
    if (!token) {
        throw new Error('Token is required to fetch marketplace data');
    }
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/marketplace`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        // Check for response status
        if (!response.ok) {
            const errorMessage = await response.text(); // Get the error message from the response
            console.error('Failed to fetch marketplace data:', response.status, errorMessage);
            throw new Error(`Failed to fetch marketplace data: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        return data.wines;
        
    } catch (error) {
        console.error('Error fetching marketplace data:', error);
        throw new Error('An error occurred while fetching marketplace data.');
    }
};
