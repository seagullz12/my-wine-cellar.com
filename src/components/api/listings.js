// components/api/listings.js

export const postForSale = async (wineId, wineData, user) => {
    if (!user) throw new Error('User not authenticated.');
    try {
        const token = await user.getIdToken();
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-listing`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                wineId: wineId || null, 
                ...wineData  
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
