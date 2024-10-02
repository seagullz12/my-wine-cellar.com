import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Snackbar, SnackbarContent } from '@mui/material';
import SellWinePreview from './SellWinePreview'; // Import the preview component
import ErrorBoundary from './ErrorBoundary';
import { PostForSale } from './api/WineForSale'; // Import the API function

const SellWineForm = ({ wine, onClose, user, setWines, setFilteredWines }) => {
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [condition, setCondition] = useState('Excellent');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [preview, setPreview] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        // You may want to handle user-related effects here if needed
    }, [user]);

    // Function to determine if the preview button should be disabled
    const isPreviewDisabled = () => {
        const priceValid = price && !isNaN(price) && Number(price) > 0;
        const quantityValid = quantity && Number(quantity) > 0;
        const conditionValid = condition.trim() !== '';
        return !(priceValid && quantityValid && conditionValid);
    };

    // Handle the form submission, and preview first
    const handleSubmit = () => {
        setPreview(true);
    };

    // Handle the actual wine listing submission (API call)
    const handlePublish = async () => {
        try {
            const updatedWine = await PostForSale(wine.id, { price, quantity, condition, additionalInfo }, user);
            setSnackbarMessage('Wine published for sale successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            
            // Delay modal close to allow Snackbar to show
            setTimeout(() => {
                onClose(); 
            }, 1000); // Close modal after 1 second
        } catch (error) {
            console.error('Error updating wine status:', error);
            setSnackbarMessage(error.message || 'Error marking wine for sale. Please try again.');
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
                                type="number" // Added type to enforce numeric input
                                inputProps={{ min: 0 }} // Prevent negative values
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
                                inputProps={{ min: 1 }} // Prevent zero or negative values
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
                                disabled={isPreviewDisabled()} // Disable button if validation fails
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
                <SnackbarContent
                    message={snackbarMessage}
                    style={{
                        backgroundColor: snackbarSeverity === 'success' ? 'green' : 'red',
                    }}
                />
            </Snackbar>
        </>
    );
};

export default SellWineForm;
