import React from 'react';
import { Typography, Paper, Grid, Box, Avatar } from '@mui/material';
import WineIcon from '@mui/icons-material/WineBar';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const SalesEarningsSection = ({ confirmedPurchaseRequestsCount, totalSalesValue, totalEarnings }) => {
    return (
        <>
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
        </>
    );
};

export default SalesEarningsSection;
