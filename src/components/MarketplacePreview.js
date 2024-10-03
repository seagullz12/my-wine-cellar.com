import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Button,
    Box,
    CircularProgress,
    Container,
} from '@mui/material';
import WineData from '../components/WineData';
import ForSaleLabel from '../components/ForSaleLabel';
import { fetchMarketplaceListings } from '../components/api/marketplace';

const MarketplacePreview = ({ token, sampleSize = 4 }) => {
    const [wines, setWines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWineListings = async () => {
            if (token) {
                try {
                    const data = await fetchMarketplaceListings(token); // Use the token passed from HomePage
                    const fetchedWines = data || [];
                    setWines(fetchedWines.slice(0, sampleSize)); // Limit to sample size
                } catch (error) {
                    console.error('Error fetching marketplace data:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchWineListings();
    }, [token, sampleSize]);

    if (loading) {
        return <CircularProgress />;
    }

    if (wines.length === 0) {
        return <Typography>No wines available at the moment.</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Marketplace Preview
            </Typography>
            <Grid container spacing={2}>
                {wines.map((wine) => (
                    <Grid item xs={12} sm={6} md={3} key={wine.wineId}>
                        <Box
                            border={0}
                            borderRadius={2}
                            overflow="hidden"
                            boxShadow={3}
                            p={2}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Link to={`/cellar/${wine.wineId}`}>
                                <CardMedia sx={{ position: 'relative' }}>
                                    <img
                                        src={wine.wineDetails.images?.front?.desktop || wine.wineDetails.images?.back?.desktop}
                                        alt={wine.wineDetails.name}
                                        style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                                    />
                                    <Box
                                        position="absolute"
                                        bottom={20}
                                        right={10}
                                        zIndex={1}
                                        sx={{ padding: 0 }}
                                    >
                                        {wine.status === "for_sale" && (<ForSaleLabel price={wine.price} />)}
                                    </Box>
                                </CardMedia>
                                <Typography variant="body1" sx={{ m: 2, mb: 1 }}><strong>{wine.wineDetails.name}</strong></Typography>
                                <Typography variant="body1" sx={{ m: 2, mb: 1 }} color="primary">
                                    {wine.sellerUsername} is selling {wine.quantity > 1 ? (
                                        <><strong>{wine.quantity} </strong> bottles for <strong>€{wine.price}</strong> each</>
                                    ) : (
                                        <><strong>{wine.quantity} </strong> bottle for <strong>€{wine.price}</strong></>
                                    )}
                                </Typography>
                            </Link>
                            <CardContent sx={{ padding: 0, margin: 1, marginBottom: 2 }}>
                                <WineData wine={wine.wineDetails} wineDetailPage={false} />
                            </CardContent>
                            <Box display="flex" justifyContent="space-between" mt="auto">
                                <Button
                                    variant="outlined"
                                    color="success"
                                    fullWidth
                                >
                                    Buy This Bottle
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default MarketplacePreview;
