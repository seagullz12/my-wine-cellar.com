import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CircularProgress,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Paper,
} from '@mui/material';
import { fetchUserWineById } from '../components/api/wines'; // Import the fetchUserWineById function
import WineIcon from '@mui/icons-material/LocalBar'; // Icon for wine
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // Icon for total sales

// Backend API Call to fetch pending purchase requests
const fetchPurchaseRequests = async (user) => {
  try {
    const token = await user.getIdToken(); // Get user token for authorization
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/get-purchase-requests?sellerId=${user.uid}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
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
    return [];
  }
};

// Backend API Call to fetch buyer profile information
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

    return await response.json(); // Return the parsed JSON data
  } catch (error) {
    console.error(`Error fetching profile for buyer ${buyerId}:`, error);
    return null; // Return null if there's an error
  }
};

const SellerDashboard = ({ user }) => {
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [wineData, setWineData] = useState({});
  const [buyerProfiles, setBuyerProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPurchaseRequests = async () => {
      if (user) {
        const requests = await fetchPurchaseRequests(user);
        setPurchaseRequests(requests);
        await loadBuyerProfiles(requests, user);
        await loadWineData(requests, user); // Load wine data for all requests
      } else {
        console.warn('User is not authenticated.');
      }
      setLoading(false);
    };

    // Load the profiles for all buyers
    const loadBuyerProfiles = async (requests, user) => {
      const token = await user.getIdToken(); // Get user token for authorization
      const profiles = {};

      for (const request of requests) {
        const buyerProfile = await fetchUserProfile(request.buyerId, token);
        if (buyerProfile) {
          profiles[request.buyerId] = buyerProfile;
        }
      }

      setBuyerProfiles(profiles); // Update the state with buyer profiles
    };

    // Load wine data for all purchase requests
    const loadWineData = async (requests, user) => {
      const token = await user.getIdToken(); // Get user token for authorization
      const wineMap = {};

      for (const request of requests) {
        const wine = await fetchUserWineById(token, request.wineId);
        if (wine) {
          wineMap[request.wineId] = wine;
        }
      }

      setWineData(wineMap); // Update the state with wine data
    };

    loadPurchaseRequests();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const getWineNameById = (wineId) => {
    const wine = wineData[wineId];
    return wine ? wine.name : 'Unknown Wine'; // Return wine name or 'Unknown'
  };

  // Calculating statistics
  const totalPurchaseRequests = purchaseRequests.length;

  const totalSalesValue = purchaseRequests.reduce((acc, request) => {
    return acc + (Number(request.totalPrice) || 0); // Ensure totalPrice is a number
  }, 0); // Start with 0 to ensure it's a number

  // Calculate total earnings by deducting the marketplaceFee from each purchase request
  const totalEarnings = purchaseRequests.reduce((acc, request) => {
    const marketplaceFee = Number(request.marketplaceFee) || 0; // Ensure marketplaceFee is a number
    return acc + (Number(request.totalPrice) || 0) - marketplaceFee; // Subtract marketplaceFee from total price
  }, 0); // Start with 0 to ensure it's a number

  return (
    <Box sx={{ mt: 4, px: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#8b3a3a' }}>
      </Typography>

      {/* Pending Sales Requests Section */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        Pending Sales Requests
      </Typography>
      {purchaseRequests.length === 0 ? (
        <Typography variant="h6" color="textSecondary" textAlign="center">
          No pending requests at the moment.
        </Typography>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {purchaseRequests.map((request) => (
            <Grid item xs={12} sm={6} lg={4} key={request.purchaseRequestId}>
              <Card sx={{ boxShadow: 3, borderRadius: 3, padding: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: '#8D6E63', marginRight: 2 }}>
                      <WineIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      {getWineNameById(request.wineId)}
                    </Typography>
                  </Box>
                  <Link to={`/cellar/${request.wineId}`} style={{ textDecoration: 'underlined' }}>
                    <Typography variant="body2" color="primary">
                      Link to cellar
                    </Typography></Link>
                  <br></br>
                  <Typography variant="body1">
                    <strong>Received At: </strong>{request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Loading...'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Status: </strong>{request.status}
                  </Typography>
                  <br></br>
                  <Typography variant="body1">
                    <strong>Total Price: </strong>€{Number(request.totalPrice).toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Marketplace Fee: </strong>€{Number(request.marketplaceFee).toFixed(2)}
                  </Typography>
                  <br></br>
                  <Typography variant="body1">
                    <strong>Buyer:</strong>  {buyerProfiles[request.buyerId]?.userName || 'Loading...'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {buyerProfiles[request.buyerId]?.email || 'Loading...'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Quantity:</strong> {request.quantity}
                  </Typography>

                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Link to={`/seller/confirm-sale/${request.purchaseRequestId}`} style={{ textDecoration: 'none' }}>
                      <Button variant="contained" color="primary" sx={{ borderRadius: 2 }}>
                        Confirm Sale
                      </Button>
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Statistics Section */}
      <Typography variant="h5" fontWeight="bold" sx={{ marginBottom: 2 }}>
        Sales & Earnings
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 4, borderRadius: 3, boxShadow: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, backgroundColor: '#FFEBEE', borderRadius: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#D32F2F', marginRight: 2 }}>
                  <WineIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Total Requests
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {totalPurchaseRequests}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, backgroundColor: '#E8F5E9', borderRadius: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#388E3C', marginRight: 2 }}>
                  <MonetizationOnIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Total Sales Value
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                €{totalSalesValue.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, backgroundColor: '#FFFDE7', borderRadius: 3 }}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#FBC02D', marginRight: 2 }}>
                  <MonetizationOnIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Total Earnings
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
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
