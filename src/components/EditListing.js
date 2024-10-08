import React, { useState } from 'react';
import { updateListing } from '../components/api/listings'; // Adjust the path accordingly
import { Button, TextField, Snackbar, Alert } from '@mui/material';

const EditListing = ({ listingId, initialWineDetails, onClose, token }) => {
    const [wineDetails, setWineDetails] = useState(initialWineDetails);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setWineDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        try {
            const result = await updateListing(listingId, wineDetails, token);
            console.log(result);
            alert('Listing updated successfully!'); // You can change this to use MUI Snackbar
            onClose(); // Close edit mode after successful update
        } catch (err) {
            setError('Failed to update listing.'); // Set error state
            console.error(err);
        } finally {
            setSnackbarOpen(true); // Open Snackbar for feedback
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <TextField
                label="Wine Name"
                name="name"
                value={wineDetails.name}
                onChange={handleChange}
                required
            />
            <TextField
                label="Price"
                name="price"
                type="number"
                value={wineDetails.price}
                onChange={handleChange}
                required
            />
            <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={wineDetails.quantity}
                onChange={handleChange}
                required
            />
            {/* Add more fields as necessary */}
            <Button type="submit" variant="contained" color="primary">
                Update Listing
            </Button>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={error ? 'error' : 'success'}>
                    {error ? error : 'Listing updated successfully!'}
                </Alert>
            </Snackbar>
        </form>
    );
};

export default EditListing;
