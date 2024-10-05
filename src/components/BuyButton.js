// src/components/BuyButton.js
import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { getAuth } from 'firebase/auth';

// Function to send purchase request using fetch
const sendPurchaseRequest = async (wineId, wineName, quantity, sellerId, price, totalPrice, user) => {

    if (!user) throw new Error('User not authenticated.');
    try {
      const token = await user.getIdToken();
      const body = JSON.stringify({
        wineId,
        wineName,
        quantity,
        buyerId: user.uid,
        price,
        totalPrice,
        sellerId,
      });
  
      // console.log('Sending request to /purchase-request with body:', body); // Debug log
  
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/send-purchase-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });
  
      // console.log('Response status:', response.status); // Debug log
  
      // Handle non-2xx HTTP response status
      if (!response.ok) {
        const errorResponse = await response.text(); // Change to text for debugging
        // console.log('Error response:', errorResponse); // Debug log
        throw new Error('Error processing purchase request');
      }
  
      // Return the processed data if the response is successful
      const { message } = await response.json();
      return message;
    } catch (error) {
      throw new Error(`Failed to send purchase request: ${error.message}`);
    }
  };
  

const BuyButton = ({ wineId, wineName, quantity, sellerId, price, totalPrice }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const auth = getAuth();
  const user = auth.currentUser;

  const handleBuy = async () => {
    // console.log('Initiating purchase with the following details:', {
    //   wineId,
    //   wineName,
    //   quantity,
    //   buyerId: user ? user.uid : null,
    //   price, 
    //   totalPrice,
    //   sellerId,
    // });

    try {
      const totalPrice = (quantity * price).toString();
      const responseMessage = await sendPurchaseRequest(wineId, wineName, quantity, sellerId, price, totalPrice, user);
      // console.log('Purchase request response:', responseMessage);
      setMessage(responseMessage);
      setSeverity('success');
    } catch (error) {
      console.error('Error sending purchase request:', error);
      setMessage(error.message);
      setSeverity('error');
    }

    setOpen(true);
  };

  const handleCloseSnackbar = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleBuy}>
        Buy
      </Button>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BuyButton;
