import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Slider, TextField, Box, Snackbar, Alert } from '@mui/material';

const WineTastingModal = ({ isOpen, onClose, wine, wineId, token }) => {
  const [acidity, setAcidity] = useState(3);
  const [sweetness, setSweetness] = useState(3);
  const [tannins, setTannins] = useState(3);
  const [body, setBody] = useState(3);
  const [flavorIntensity, setFlavorIntensity] = useState(3);
  const [tastingNotes, setTastingNotes] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message
  const [modalClosed, setModalClosed] = useState(false); // State to track modal close

  const marks = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
  ];

  if (!wine) {
    console.log('Wine object undefined');
    return null;
  }

  const handleSliderChange = (setValue) => (event, newValue) => {
    setValue(newValue);
  };

  const handleConfirmConsume = async () => {
    const tastingData = {
      openedAt: new Date().toISOString(),
      acidity,
      sweetness,
      tannins,
      body,
      flavorIntensity,
      tastingNotes
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update-wine-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,  // Send token for authentication
        },
        body: JSON.stringify({
          id: wineId,
          wineData: {
            status: 'consumed', // Update status if applicable
            tasting: {
              ...tastingData
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update wine data');
      }

      const updatedWine = await response.json();
      console.log('Wine updated successfully:', updatedWine);

      // Show Snackbar on successful submission
      setSnackbarMessage('Tasting notes submitted successfully!');
      setSnackbarOpen(true);  // Open Snackbar
      setModalClosed(true); // Set modal closed state
    } catch (error) {
      console.error('Error updating wine data:', error);
      setSnackbarMessage('Error submitting tasting notes. Please try again.');
      setSnackbarOpen(true);  // Open Snackbar on error
      setModalClosed(false); // Reset modal closed state
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    if (modalClosed) {
      onClose(); // Close modal after Snackbar if it was a success
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>🥂 Dive into a Bottle of {wine.name}!</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" gutterBottom>
          Record your tasting experience and rate the flavors you enjoyed!
        </Typography>
        {/* Acidity Slider */}
        <Box mt={3}>
          <Typography variant="body2" gutterBottom>Acidity (Low to High)</Typography>
          <Slider
            value={acidity}
            onChange={handleSliderChange(setAcidity)}
            step={1}
            marks={marks}
            min={1}
            max={5}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Sweetness Slider */}
        <Box mt={2}>
          <Typography variant="body2" gutterBottom>Sweetness (Low to High)</Typography>
          <Slider
            value={sweetness}
            onChange={handleSliderChange(setSweetness)}
            step={1}
            marks={marks}
            min={1}
            max={5}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Tannins Slider */}
        <Box mt={2}>
          <Typography variant="body2" gutterBottom>Tannins (Low to High)</Typography>
          <Slider
            value={tannins}
            onChange={handleSliderChange(setTannins)}
            step={1}
            marks={marks}
            min={1}
            max={5}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Body Slider */}
        <Box mt={2}>
          <Typography variant="body2" gutterBottom>Body (Light to Full)</Typography>
          <Slider
            value={body}
            onChange={handleSliderChange(setBody)}
            step={1}
            marks={marks}
            min={1}
            max={5}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Flavor Intensity Slider */}
        <Box mt={2}>
          <Typography variant="body2" gutterBottom>Flavor Intensity (Low to High)</Typography>
          <Slider
            value={flavorIntensity}
            onChange={handleSliderChange(setFlavorIntensity)}
            step={1}
            marks={marks}
            min={1}
            max={5}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Tasting Notes */}
        <Box mt={3}>
          <TextField
            label="Tasting Notes (Optional)"
            multiline
            rows={4}
            fullWidth
            value={tastingNotes}
            onChange={(e) => setTastingNotes(e.target.value)}
            variant="outlined"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleConfirmConsume} color="primary">
          Confirm Consumption
        </Button>
      </DialogActions>

      {/* Snackbar for feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarMessage.includes('Error') ? 'error' : 'success'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default WineTastingModal;