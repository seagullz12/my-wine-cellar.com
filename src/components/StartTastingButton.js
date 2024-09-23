const StartTastingButton = ({ wineId, backendURL, user, onTastingStarted }) => {
  if (!user) return <p>User not authenticated</p>; // Ensure user is authenticated

  const startTastingSession = async () => {
    try {
      const token = await user.getIdToken(); // Get the user's ID token for authorization

      // Create the body with both 'id' and 'wineData'
      console.log('wine id: ', wineId)
      const requestBody = {
        id: wineId, // This is the wine's unique ID
        wineData: {
          status: 'in_tasting', // Update the status to indicate the wine is being tasted
          tastingSession: {
            inProgress: true,
            openedDate: new Date().toISOString(), // Set the opened date to the current time
          },
        },
      };

      // Make the PUT request to update the wine data
      const response = await fetch(`${backendURL}/update-wine-data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody), // Send the request body as JSON
      });

      if (!response.ok) {
        throw new Error('Failed to start tasting session');
      }

      const updatedWine = await response.json(); // Parse the response
      onTastingStarted(updatedWine.data); // Notify the parent component that the tasting has started
    } catch (error) {
      console.error('Error starting tasting session:', error);
    }
  };

  return (
    <button onClick={startTastingSession}>
      Start Tasting
    </button>
  );
};


export default StartTastingButton;
