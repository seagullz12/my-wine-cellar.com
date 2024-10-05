import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Box, CircularProgress, Card, CardContent } from '@mui/material';

// Backend API call to fetch purchase request details
const fetchPurchaseRequestDetails = async (requestId, user) => {
    try {
        const token = await user.getIdToken(); // Get user token if needed for authorization
        // console.log("Fetching details for request ID:", requestId); // Log the requestId

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-purchase-request/${requestId}`, {  // Correct URL to match the route
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Include token in headers if required
                'Content-Type': 'application/json',
            },
        });

        // Check for non-2xx responses
        if (!response.ok) {
            console.error('Response not OK:', response); // Log the response
            const errorResponse = await response.text(); // Capture the text response to handle HTML responses
            throw new Error(errorResponse || 'Error fetching purchase request details');
        }

        const data = await response.json();
        // console.log("Received data:", data); // Log the data received
        return data.purchaseRequest;
    } catch (error) {
        console.error('Error fetching purchase request details:', error);
        return null;
    }
};


// Backend API call to confirm the sale
const confirmSale = async (requestId, user) => {
    try {
        const token = await user.getIdToken(); // Get user token if needed for authorization
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/seller/confirm-sale`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Include token in headers if required
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ purchaseRequestId: requestId, sellerId: user.uid }), // Corrected request body
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error confirming sale:', error);
    }
};

const ConfirmSalePage = ({ user }) => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [purchaseRequest, setPurchaseRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = user.uid;

    useEffect(() => {
        const loadRequestDetails = async () => {
            const requestDetails = await fetchPurchaseRequestDetails(requestId, user);
            setPurchaseRequest(requestDetails);
            setLoading(false);
        };

        loadRequestDetails();
    }, [requestId]);

    const handleConfirmSale = async () => {
        const result = await confirmSale(requestId, user);
        if (result && result.success) {
            alert('Sale confirmed successfully!');
            navigate('/seller/dashboard'); // Navigate back to the dashboard
        } else {
            alert('Error confirming the sale. Please try again.');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (!purchaseRequest) {
        return <Typography>Purchase request not found.</Typography>;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Confirm Purchase</Typography>
                    <Typography>Wine: {purchaseRequest.wineName}</Typography>
                    <Typography>Quantity: {purchaseRequest.quantity}</Typography>
                    <Typography>Total Price: ${purchaseRequest.totalPrice * purchaseRequest.quantity}</Typography>
                    <Typography>
                        Requested at: {purchaseRequest.requestedAt ? new Date(purchaseRequest.requestedAt).toLocaleString() : 'Loading...'}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleConfirmSale}>
                            Confirm Sale
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ConfirmSalePage;
