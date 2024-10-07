import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Snackbar, Alert } from '@mui/material';
import SellWinePreview from './SellWinePreview'; // Import the preview component
import ErrorBoundary from './ErrorBoundary';
import { addListing } from './api/listings'; // Updated API function
import { fetchUserProfile } from './api/user'; // Import user profile function

const SellWineForm = ({ wineId, wine, onClose, token }) => {
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [condition, setCondition] = useState('Excellent');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [preview, setPreview] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [email, setEmail] = useState('');
    const [userName, setUsername] = useState('');

     // Function to determine if the preview button should be disabled
     const isPreviewDisabled = () => {
        return !(price > 0 && quantity > 0 && condition.trim() !== '');
    };

    // Handle form preview
    const handleSubmit = () => {
        setPreview(true);
    };

    // Handle publishing the wine listing
    const handlePublish = async () => {
        try {
            // Fetch user details only at the time of publishing
            const profileData = await fetchUserProfile(token);
            const { email, userName } = profileData;

            const updatedWine = await addListing(
                wineId, 
                { wineDetails: wine, price, quantity, condition, additionalInfo }, 
                { sellerDetails: {email, userName} }, 
                token
            );
            
            setSnackbarMessage('Wine published for sale successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            setTimeout(() => {
                onClose(); // Close modal after Snackbar is shown
            }, 1000);
        } catch (error) {
            console.error('Error updating wine status:', error);
            setSnackbarMessage(error.message || 'Error listing wine for sale. Please try again.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    // Close snackbar handler
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <>
            {preview ? (
                <ErrorBoundary>
                    <SellWinePreview
                        wine={wine}
                        price={price}
                        quantity={quantity}
                        condition={condition}
                        additionalInfo={additionalInfo}
                        onEdit={() => setPreview(false)}
                        onPublish={handlePublish}
                    />
                </ErrorBoundary>
            ) : (
                <form>
                    <Grid container spacing={2} sx={{ p: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Price per bottle"
                                variant="outlined"
                                fullWidth
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                type="number"
                                inputProps={{ min: 0 }}
                                error={price <= 0}
                                helperText={price <= 0 ? 'Price must be greater than 0' : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Quantity"
                                type="number"
                                variant="outlined"
                                fullWidth
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                inputProps={{ min: 1 }}
                                error={quantity <= 0}
                                helperText={quantity <= 0 ? 'Quantity must be at least 1' : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Condition"
                                variant="outlined"
                                fullWidth
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Additional Information"
                                variant="outlined"
                                fullWidth
                                value={additionalInfo}
                                onChange={(e) => setAdditionalInfo(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button variant="contained" color="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                disabled={isPreviewDisabled()} // Disable if validation fails
                                sx={{ ml: 2 }}
                            >
                                Preview Listing
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            )}

            {/* Snackbar for success or error messages */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default SellWineForm;
