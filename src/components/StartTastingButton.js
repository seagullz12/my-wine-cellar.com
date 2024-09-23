const StartTastingButton = ({ wineId, backendURL, user, onTastingStarted }) => {
  if (!user) return <p>User not authenticated</p>; // Ensure user is authenticated

  const startTastingSession = async () => {

    try {
      const token = await user.getIdToken();
      const requestBody = {
        id: wineId, 
        wineData: {
          status: 'consumed', // Update status if applicable
            tasting: {
            openedAt: new Date().toISOString()
            }
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
