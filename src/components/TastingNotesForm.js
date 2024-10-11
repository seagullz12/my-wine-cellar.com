import React, { useState } from 'react';
import {useParams} from 'react-router-dom';
import { TextField, Button, Typography, Box } from '@mui/material';
import { WineBarRounded } from '@mui/icons-material';

const TastingForm = ({ user, wine, handleIsTasting }) => {
  const [tastingNotes, setTastingNotes] = useState('');
  const { id: wineId } = useParams();
  const [rating, setRating] = useState('');
  const [finalNotes, setFinalNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(wineId)
      const token = await user.getIdToken();
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update-wine-data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: wineId,
          wineData: {
            status: 'consumed', // Update status if applicable
            tasting: {
              openedAt: new Date().toISOString(),
              tastingNotes,
              finalNotes,
              rating,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save tasting notes');
      }

      // Call handleIsTasting to update the state in the parent component
      handleIsTasting({
        tastingNotes,
        finalNotes,
        rating,
        status: 'consumed', // Example additional data
      });

      // Clear form after submission
      setTastingNotes('');
      setRating('');
      setFinalNotes('');
      setSuccessMessage('Tasting notes saved successfully!');
      setErrorMessage('');
    } catch (error) {
      console.error('Error saving tasting notes:', error);
      setErrorMessage('Error saving tasting notes: ' + error.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, p:2}}>
      <Typography variant="h5" gutterBottom>Tasting Notes</Typography>
      <TextField
        multiline
        rows={4}
        value={tastingNotes}
        onChange={(e) => setTastingNotes(e.target.value)}
        placeholder= {wine.tasting ? wine.tasting.tastingNotes : "Enter your tasting notes here..."}
        required
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <TextField
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        placeholder= {wine.tasting ? wine.tasting.rating : "Rate this wine (1-5)"}
        required
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <TextField
        multiline
        rows={2}
        value={finalNotes}
        onChange={(e) => setFinalNotes(e.target.value)}
        placeholder= {wine.tasting ? wine.tasting.finalNotes : "Final thoughts after drinking..."}
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
      >
        Save Tasting Notes
      </Button>

      {/* Display success message */}
      {successMessage && <Typography color="success.main" sx={{ mt: 2 }}>{successMessage}</Typography>}

      {/* Display error message */}
      {errorMessage && <Typography color="error.main" sx={{ mt: 2 }}>{errorMessage}</Typography>}
    </Box>
  );
};

export default TastingForm;
