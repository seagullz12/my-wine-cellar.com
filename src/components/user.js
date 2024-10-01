const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';
//const backendURL = 'http://192.168.2.9:8080';

export const fetchUserProfile = async (token) => {
    try {
        const response = await fetch(`${backendURL}/get-user-profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            // Handle different error statuses accordingly
            const errorMessage = await response.text();
            switch (response.status) {
                case 404:
                    throw new Error('User profile not found');
                case 500:
                    throw new Error('Internal server error');
                default:
                    throw new Error(errorMessage || 'Error fetching profile data');
            }
        }

        return await response.json(); // Return the parsed JSON data
    } catch (error) {
        console.error('Fetch User Profile Error:', error);
        throw error; // Re-throw the error to be handled by the calling function
    }
};

export const updateUserProfile = async (token, userData) => {
    try {
        const response = await fetch(`${backendURL}/update-user-profile`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData), // Ensure the structure matches what your backend expects
        });

        // Check if the response is OK
        if (!response.ok) {
            const responseText = await response.text(); // Get response text for debugging
            console.log('Response Text:', responseText); // Log for debugging

            // Handle different error statuses accordingly
            switch (response.status) {
                case 404:
                    throw new Error('User profile not found for update');
                case 500:
                    throw new Error('Internal server error');
                default:
                    throw new Error(responseText || 'Error updating profile');
            }
        }

        return await response.json(); // Now return the parsed JSON data
    } catch (error) {
        console.error('Update User Profile Error:', error);
        throw error; // Re-throw the error to be handled by the calling function
    }
};
