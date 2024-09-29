// src/components/SellWine.js
import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';

const SellWine = ({ wine, wineId, onSuccess }) => {
  const [price, setPrice] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';

  const handleSellWine = async () => {
    if (parseFloat(price) <= 0) {
      setSnackbarMessage('Price must be a positive number.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
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
            wineData: { status: 'for_sale', price: parseFloat(price) },
          }),
        });

        if (response.ok) {
          const updatedWine = await response.json();
          setSnackbarMessage(`Wine ${updatedWine.data.name} listed for sale successfully at $${price}!`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          if (onSuccess) onSuccess(); // Call the onSuccess callback to notify the parent
        } else {
          throw new Error('Error updating wine data');
        }
      } catch (error) {
        console.error('Error selling wine:', error);
        setSnackbarMessage('Error listing wine for sale. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4,ml:0}}>
      <Typography variant="h4" gutterBottom>
        Sell Your Wine
      </Typography>
      <Typography variant="h6">{wine.name}</Typography>

      <TextField
        label="Selling Price"
        type="number"
        fullWidth
        margin="normal"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <Button variant="contained" color="primary" onClick={handleSellWine} sx={{m:2}}>
        List for Sale
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SellWine;
