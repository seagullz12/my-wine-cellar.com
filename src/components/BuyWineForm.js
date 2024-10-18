import React, { useState } from 'react';
import {
    TextField,
    Button,
    Grid,
    Snackbar,
    Alert,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';

// Function to send purchase request
const sendPurchaseRequest = async (purchaseDetails) => {
    const { wineId, wineName, vintage, quantity, userId, userEmail, userName, price, totalPrice, sellerId, sellerEmail, sellerUsername, listingId, token } = purchaseDetails;

    if (!userId) throw new Error('User not authenticated.');

    const body = JSON.stringify({
        wineId,
        wineName,
        vintage,
        quantity,
        buyerId: userId,
        buyerName: userName,
        buyerEmail: userEmail,
        price,
        totalPrice,
        sellerId,
        sellerEmail,
        sellerUsername,
        listingId,
    });

    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/send-purchase-request`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body,
    });

    if (!response.ok) {
        const errorResponse = await response.text();
        throw new Error('Error processing purchase request: ' + errorResponse);
    }

    const { message } = await response.json();
    return message;
};

const BuyWineForm = ({ wine, onClose, user, token }) => {
    const [quantity, setQuantity] = useState(1);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handlePurchase = async () => {
        if (!user) {
            showSnackbar('User not authenticated.', 'error');
            return;
        }

        if (quantity > wine.quantity) {
            showSnackbar(`Insufficient quantity available. Only ${wine.quantity} left.`, 'error');
            return;
        }

        try {
            const totalPrice = (quantity * wine.price).toFixed(2);
            const responseMessage = await sendPurchaseRequest({
                wineId: wine.wineId,
                wineName: wine.wineDetails.name,
                vintage: wine.wineDetails.vintage,
                quantity,
                userId: user.uid,
                userName: user.displayName,
                userEmail: user.email,
                price: wine.price,
                totalPrice,
                sellerId: wine.sellerDetails.sellerId,
                sellerEmail: wine.sellerDetails.email,
                sellerUsername: wine.sellerDetails.userName,
                listingId: wine.listingId,
                token
            });

            showSnackbar(responseMessage, 'success');
            // Close modal after showing success message
            setTimeout(onClose, 1000);
        } catch (error) {
            console.error('Error purchasing wine:', error);
            showSnackbar(error.message, 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return; // Prevent closing on clickaway
        }
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <>
            <DialogTitle>Buy Wine</DialogTitle>
            <DialogContent>
                <form>
                    <Grid container spacing={2} sx={{ p: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Quantity"
                                type="number"
                                variant="outlined"
                                fullWidth
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                required
                                inputProps={{ min: 1, max: wine.quantity }} // Set max to available quantity
                                error={quantity <= 0 || quantity > wine.quantity}
                                helperText={
                                    quantity <= 0 
                                        ? 'Quantity must be at least 1' 
                                        : quantity > wine.quantity 
                                            ? `Only ${wine.quantity} available` 
                                            : ''
                                }
                            />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePurchase}
                    disabled={quantity <= 0 || quantity > wine.quantity} // Disable button if quantity is invalid
                    sx={{ ml: 2 }}
                >
                    Confirm Purchase
                </Button>
            </DialogActions>

            {/* Snackbar for success or error messages */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default BuyWineForm;
