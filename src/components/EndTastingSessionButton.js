const endTastingSession = async (wineId, user, backendURL, finalNotes) => {
    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`${backendURL}/update-wine-data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: wineId,
          wineData: {
            status: 'consumed', // Mark the wine as consumed
            consumedDate: new Date().toISOString(), // Set the current date as consumed date
            tastingSession: {
              inProgress: false,
              finalNotes: finalNotes || '', // Optional field for user to add tasting notes
            }
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to end tasting session');
      
      const updatedWine = await response.json();
      console.log('Tasting session ended:', updatedWine.data);
    } catch (error) {
      console.error('Error ending tasting session:', error);
    }
  };
  