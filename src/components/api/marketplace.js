export const fetchMarketplaceListings = async (token, sampleSize, myListings = false) => {
    // Check if the token is provided
    if (!token) {
        throw new Error('Token is required to fetch marketplace data');
    }

    // Check if sampleSize is a valid number
    if (sampleSize && (typeof sampleSize !== 'number' || sampleSize <= 0)) {
        throw new Error('sampleSize must be a positive number');
    }

    try {
        // Construct the URL and append query parameters
        const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/marketplace`);

        // Append sampleSize as a query parameter if provided
        if (sampleSize) {
            url.searchParams.append('sampleSize', sampleSize);
        }

        // Append myListings as a query parameter if true
        if (myListings) {
            url.searchParams.append('myListings', 'true');
        }

        const response = await fetch(url, {
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
