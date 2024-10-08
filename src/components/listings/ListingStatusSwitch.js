import React, { useState } from 'react';
import { Switch, CircularProgress, Box, Typography } from '@mui/material';
import { updateListingStatus } from '../api/listings'; // API call to update status

const ListingStatusSwitch = ({ listingId, currentStatus, token, onStatusChange }) => {
    const [status, setStatus] = useState(currentStatus === 'active');
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        const newStatus = status ? 'inactive' : 'active'; // Toggle between active and inactive

        try {
            await updateListingStatus(listingId, newStatus, token); // API call to update status
            setStatus(!status); // Update the local state after success
            onStatusChange(newStatus); // Notify parent component about the status change
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" alignItems="center">
            {loading ? (
                <CircularProgress size={24} />
            ) : (
                <>
                    {/* The Switch */}
                    <Switch checked={status} onChange={handleToggle} color="primary" />

                    {/* The Label */}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                        {status ? 'Active' : 'Inactive'}
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default ListingStatusSwitch;
