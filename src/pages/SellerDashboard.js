import React, { useState, useEffect, useMemo } from 'react';
import {
    CircularProgress,
    Button,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    Paper,
    Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WineIcon from '@mui/icons-material/LocalBar';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { fetchUserWineById } from '../components/api/wines';
import { Link } from 'react-router-dom';

// Utility functions for fetching data
const fetchPurchaseRequests = async (user) => {
    try {
        const token = await user.getIdToken();
        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/get-purchase-requests?sellerId=${user.uid}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Error fetching purchase requests');
        }

        const data = await response.json();
        return data.purchaseRequests;
    } catch (error) {
        console.error('Error fetching purchase requests:', error);
        return []; // Return an empty array on error
    }
};

const fetchUserProfile = async (buyerId, token) => {
    try {
        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/get-user-profile?userId=${buyerId}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Error fetching buyer profile');
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching profile for buyer ${buyerId}:`, error);
        return null;
    }
};

const SkeletonLoader = () => (
    <Card>
        <CardContent>
            <Typography variant="body1"><strong>Loading...</strong></Typography>
            <CircularProgress />
        </CardContent>
    </Card>
);

const SellerDashboard = ({ user }) => {
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [wineData, setWineData] = useState({});
    const [buyerProfiles, setBuyerProfiles] = useState({});
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        const loadPurchaseRequests = async () => {
            if (user) {
              console.log(user)
                const requests = await fetchPurchaseRequests(user);
                setPurchaseRequests(requests);
                await loadBuyerProfiles(requests, user);
                await loadWineData(requests, user);
            } else {
                console.warn('User is not authenticated.');
            }
            setLoading(false); // Set loading to false after all data has been fetched
        };

        // Load the profiles for all buyers
        const loadBuyerProfiles = async (requests, user) => {
            const token = await user.getIdToken();
            const profiles = await Promise.all(
                requests.map(async (request) => {
                    if (!buyerProfiles[request.buyerId]) {
                        const buyerProfile = await fetchUserProfile(request.buyerId, token);
                        return { [request.buyerId]: buyerProfile }; // Return an object for merging
                    }
                    return null;
                })
            );

            const filteredProfiles = profiles.reduce((acc, profile) => {
                if (profile) {
                    return { ...acc, ...profile };
                }
                return acc;
            }, {});

            setBuyerProfiles((prevProfiles) => ({ ...prevProfiles, ...filteredProfiles }));
        };

        // Load wine data for all purchase requests
        const loadWineData = async (requests, user) => {
            const token = await user.getIdToken();
            const wineMap = await Promise.all(
                requests.map(async (request) => {
                    const wine = await fetchUserWineById(token, request.wineId);
                    return wine ? { [request.wineId]: wine } : null;
                })
            );

            const filteredWines = wineMap.reduce((acc, wine) => {
                if (wine) {
                    return { ...acc, ...wine };
                }
                return acc;
            }, {});

            setWineData(filteredWines);
        };

        loadPurchaseRequests();

        // Cleanup function
        return () => {
            setPurchaseRequests([]);
            setWineData({});
            setBuyerProfiles({});
        };
    }, [user]);

    const handleSaleAction = async (purchaseRequestId, action) => {
        try {
            const token = await user.getIdToken();
            const sellerId = user.uid;
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/seller/handle-purchase-request`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ purchaseRequestId, sellerId, action }),
                }
            );

            if (!response.ok) {
                throw new Error(`Error ${action === 'confirm' ? 'confirming' : 'rejecting'} sale`);
            }

            const result = await response.json();
            setPurchaseRequests((prevRequests) =>
                prevRequests.filter((request) => request.purchaseRequestId !== purchaseRequestId)
            );

            setSnackbarMessage(result.message);
            setSnackbarOpen(true);
        } catch (error) {
            console.error(`Error ${action === 'confirm' ? 'confirming' : 'rejecting'} sale:`, error);
            setSnackbarMessage(`Failed to ${action === 'confirm' ? 'confirm' : 'reject'} sale. Please try again.`);
            setSnackbarOpen(true);
        }
    };

    // Separate purchase requests into categories: pending, confirmed, rejected
    const pendingRequests = purchaseRequests.filter((request) => request.status === 'pending_confirmation');
    const confirmedRequests = purchaseRequests.filter((request) => request.status === 'confirmed');
    const rejectedRequests = purchaseRequests.filter((request) => request.status === 'rejected');

    // Calculating statistics
    const totalPurchaseRequestsCount = purchaseRequests.length;
    const confirmedPurchaseRequestsCount = confirmedRequests.length;
    const rejectedPurchaseRequestsCount = rejectedRequests.length;

    const totalSalesValue = confirmedRequests.reduce((acc, request) => {
        return acc + (Number(request.totalPrice) || 0); // Ensure totalPrice is a number
    }, 0); // Start with 0 to ensure it's a number

    const totalEarnings = confirmedRequests.reduce((acc, request) => {
        const marketplaceFee = Number(request.marketplaceFee) || 0; // Ensure marketplaceFee is a number
        return acc + (Number(request.totalPrice) || 0) - marketplaceFee; // Subtract marketplaceFee from total price
    }, 0); // Start with 0 to ensure it's a number

    const getWineNameById = (wineId) => {
        const wine = wineData[wineId];
        return wine ? wine.name : 'Unknown Wine'; // Return wine name or 'Unknown'
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4, px: 3 }}>
            {/* Pending Sales Requests Section */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                Pending Sales Requests
            </Typography>
            {pendingRequests.length === 0 ? (
                <Typography variant="h6" color="textSecondary" textAlign="center">
                    No pending requests at the moment.
                </Typography>
            ) : (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {pendingRequests.map((request) => (
                        <Grid item xs={12} sm={6} lg={4} key={request.purchaseRequestId}>
                            <Card sx={{
                                boxShadow: 3,
                                borderRadius: 3,
                                padding: 2,
                                height: '100%' // Ensure card takes full height of the grid item
                            }}>
                                <CardContent sx={{
                                    display: 'flex',
                                    flexDirection: 'column', // Arrange contents vertically
                                    height: '100%', // Ensure content stretches to fill the card
                                }}>

                                    {/* Always Visible Content */}
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Avatar sx={{ bgcolor: '#8D6E63', marginRight: 2 }}>
                                            <WineIcon />
                                        </Avatar>
                                        <Typography variant="body1" fontWeight="bold">
                                            {getWineNameById(request.wineId)}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body1">
                                        <strong>Received at: </strong>{request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Loading...'}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Total Price: </strong>€{Number(request.totalPrice).toFixed(2)}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Bottles:</strong> {request.quantity}
                                    </Typography>

                                    {/* Collapsible Section */}
                                    <Accordion sx={{ boxShadow: 0, mt: 2 }} disableGutters>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="body2" color="textSecondary">
                                                More Details
                                            </Typography>  </AccordionSummary>
                                        <AccordionDetails sx={{ p: 0 }}>
                                            {/* Request Details */}
                                            <Typography variant="body1">
                                                <strong>Marketplace Fee: </strong>€{Number(request.marketplaceFee).toFixed(2)}
                                            </Typography>
                                            <Typography variant="body1" sx={{ mt: 2 }}>
                                                <strong>Buyer:</strong> {buyerProfiles[request.buyerId]?.userName || 'Loading...'}
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>Email:</strong> {buyerProfiles[request.buyerId]?.email || 'Loading...'}
                                            </Typography>
                                            <Link to={`/cellar/${request.wineId}`} style={{ textDecoration: 'underline' }}>
                                                <Typography variant="body2" color="primary" sx={{ boxShadow: 0, mt: 2 }}>
                                                    Link to cellar
                                                </Typography>
                                            </Link>
                                        </AccordionDetails>
                                    </Accordion>
                                    {/* Confirm and Reject Buttons */}
                                    <Box mt={2} display="flex" justifyContent="space-between">
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleSaleAction(request.purchaseRequestId, 'reject')}
                                        >
                                            Reject Sale
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={() => handleSaleAction(request.purchaseRequestId, 'confirm')}
                                            startIcon={<MonetizationOnIcon />}
                                        >
                                            Confirm Sale
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Historic Requests Section */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                Historic Requests
            </Typography>

            {/* Confirmed Requests Section */}
            <Accordion defaultExpanded sx={{ boxShadow: 3, borderRadius: 3, padding: 0, marginBottom: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Confirmed Requests</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {confirmedRequests.length === 0 ? (
                        <Typography variant="body1" color="textSecondary" textAlign="center">
                            No confirmed requests.
                        </Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {confirmedRequests.map((request) => (
                                <Grid item xs={12} sm={6} lg={4} key={request.purchaseRequestId}>
                                    <Card sx={{ boxShadow: 3, borderRadius: 3, padding: 2 }}>
                                        <CardContent>
                                            <Typography variant="body1">
                                                <strong>Status: </strong>Confirmed
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>Total Price: </strong>€{Number(request.totalPrice).toFixed(2)}
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>Buyer:</strong> {buyerProfiles[request.buyerId]?.userName || 'Loading...'}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Confirmed At: {new Date(request.confirmedAt).toLocaleString()}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </AccordionDetails>
            </Accordion>

            {/* Rejected Requests Section */}
            <Accordion defaultExpanded sx={{ boxShadow: 3, borderRadius: 3, padding: 0, marginBottom: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Rejected Requests</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {rejectedRequests.length === 0 ? (
                        <Typography variant="body1" color="textSecondary" textAlign="center">
                            No rejected requests.
                        </Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {rejectedRequests.map((request) => (
                                <Grid item xs={12} sm={6} lg={4} key={request.purchaseRequestId}>
                                    <Card sx={{ boxShadow: 3, borderRadius: 3, padding: 2 }}>
                                        <CardContent>
                                            <Typography variant="body1">
                                                <strong>Status: </strong>Rejected
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>Total Price: </strong>€{Number(request.totalPrice).toFixed(2)}
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>Buyer:</strong> {buyerProfiles[request.buyerId]?.userName || 'Loading...'}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Rejected At: {new Date(request.rejectedAt).toLocaleString()}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </AccordionDetails>
            </Accordion>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />

            {/* Statistics Section */}
            <Typography variant="h5" fontWeight="bold" sx={{ marginBottom: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                Sales & Earnings
            </Typography>
            <Paper sx={{ padding: { xs: 2, sm: 3 }, marginBottom: 2, borderRadius: 2, boxShadow: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, backgroundColor: '#FFEBEE', borderRadius: 2 }}>
                            <Box display="flex" alignItems="center">
                                <Avatar sx={{ bgcolor: '#D32F2F', marginRight: 1 }}>
                                    <WineIcon />
                                </Avatar>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Confirmed Requests
                                </Typography>
                            </Box>
                            <Typography variant="h5" sx={{ mt: 1 }}>
                                {confirmedPurchaseRequestsCount}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, backgroundColor: '#E8F5E9', borderRadius: 2 }}>
                            <Box display="flex" alignItems="center">
                                <Avatar sx={{ bgcolor: '#388E3C', marginRight: 1 }}>
                                    <MonetizationOnIcon />
                                </Avatar>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Total Sales Value
                                </Typography>
                            </Box>
                            <Typography variant="h5" sx={{ mt: 1 }}>
                                €{totalSalesValue.toFixed(2)}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, backgroundColor: '#FFFDE7', borderRadius: 2 }}>
                            <Box display="flex" alignItems="center">
                                <Avatar sx={{ bgcolor: '#FBC02D', marginRight: 1 }}>
                                    <MonetizationOnIcon />
                                </Avatar>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Total Earnings
                                </Typography>
                            </Box>
                            <Typography variant="h5" sx={{ mt: 1 }}>
                                €{totalEarnings.toFixed(2)}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default SellerDashboard;