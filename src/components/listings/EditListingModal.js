import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Snackbar, Alert } from '@mui/material';
import { updateListing } from '../api/listings'; 

const EditListingModal = ({ open, onClose, listingId, initialDetails, token }) => {
    const [listingDetails, setListingDetails] = useState(initialDetails);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setListingDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        try {
            const result = await updateListing(listingId, listingDetails, token);
            console.log(result);
            onClose(); // Close the modal on success
            alert('Listing updated successfully!'); // Optional: Use Snackbar instead
        } catch (err) {
            setError('Failed to update listing.'); // Set error state
            console.error(err);
        } finally {
            setSnackbarOpen(true); // Open Snackbar for feedback
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Listing</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Price"
                        name="price"
                        type="number"
                        value={listingDetails.price}
                        onChange={handleChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={listingDetails.quantity}
                        onChange={handleChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    {/* Add more fields as necessary */}
                    <DialogActions>
                        <Button onClick={onClose} color="primary">Cancel</Button>
                        <Button type="submit" color="primary">Update</Button>
                    </DialogActions>
                </form>
            </DialogContent>

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
        </Dialog>
    );
};

export default EditListingModal;
