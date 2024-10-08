import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import {
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Button,
    Box,
    CircularProgress,
    Container,
    Snackbar,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WineListSorting from '../components/WineListSorting';
import WineData from '../components/WineData';
import ForSaleLabel from '../components/ForSaleLabel';
import { fetchMarketplaceListings } from '../components/api/marketplace';
import { deleteListing } from '../components/api/listings';
import EditListingModal from '../components/listings/EditListingModal';
import ListingStatusSwitch from '../components/listings/ListingStatusSwitch';

const ManageListings = () => {
    const [wines, setWines] = useState([]);
    const [filteredWines, setFilteredWines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [sortCriteria, setSortCriteria] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentListing, setCurrentListing] = useState(null);
    const [token, setToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const fetchWineListings = useCallback(async () => {
        if (user) {
            try {
                const token = await user.getIdToken();
                setToken(token);
                const data = await fetchMarketplaceListings(token, null, true);
                const fetchedWines = data || [];
                setWines(fetchedWines);
                setFilteredWines(fetchedWines);
            } catch (error) {
                console.error('Error fetching marketplace data:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWineListings();
    }, [fetchWineListings]);

    const handleDeleteListing = async (listingId) => {
        if (!window.confirm("Are you sure you want to remove this listing?")) {
            return;
        }

        setIsDeleting(true);
        try {
            const token = await user.getIdToken();
            await deleteListing(listingId, token);
            setWines((prevWines) => prevWines.filter(wine => wine.listingId !== listingId));
            setFilteredWines((prevFilteredWines) => prevFilteredWines.filter(wine => wine.listingId !== listingId));
            setSnackbarMessage('Listing removed successfully.');
        } catch (error) {
            console.error('Error deleting listing:', error);
            setSnackbarMessage('Failed to remove listing.');
        } finally {
            setIsDeleting(false);
            setSnackbarOpen(true);
        }
    };

    const sortWines = (winesArray) => {
        return winesArray.sort((a, b) => {
            let comparison = 0;
            if (sortCriteria === 'vintage') {
                comparison = a.wineDetails.vintage.localeCompare(b.wineDetails.vintage);
            } else if (sortCriteria === 'name') {
                comparison = a.wineDetails.name.localeCompare(b.wineDetails.name);
            }

            return sortOrder === 'asc' ? comparison : comparison * -1;
        });
    };

    const sortedWines = useMemo(() => {
        return sortWines(filteredWines);
    }, [filteredWines, sortCriteria, sortOrder]);

    const handleSortChange = useCallback((event) => {
        const { value } = event.target;
        setSortCriteria(value);
    }, []);

    const handleSortOrderChange = useCallback(() => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    if (!user) {
        return <Typography>Please log in to manage your listings.</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box my={2}>
                <WineListSorting
                    sortCriteria={sortCriteria}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    onSortOrderChange={handleSortOrderChange}
                />
            </Box>

            <Grid container spacing={2}>
                {filteredWines.length > 0 ? (
                    filteredWines.map((wine) => (
                        <Grid item xs={12} sm={6} md={3} key={wine.listingId}>
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
                                <CardMedia sx={{ position: 'relative' }}>
                                    <img
                                        src={wine.wineDetails.images?.front?.desktop || wine.wineDetails.images?.back?.desktop}
                                        srcSet={`${wine.wineDetails.images?.front?.mobile || wine.wineDetails.images?.back?.mobile} 600w,
                      ${wine.wineDetails.images?.front?.desktop || wine.wineDetails.images?.back?.desktop} 1200w`}
                                        sizes="(max-width: 600px) 100vw, 1200px"
                                        alt={wine.wineDetails.name}
                                        className="wine-image"
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

                                {/* listing information */}
                                <CardContent sx={{
                                    padding: 2,
                                    margin: 1,
                                    marginBottom: 2,
                                    border: '1px solid #ddd',
                                    borderRadius: 1,

                                }}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h6">
                                            <strong>Listing Details:</strong>
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ mb: 1 }} >
                                        <strong>Price (per bottle): </strong> €{wine.price}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }} >
                                        <strong>Number of bottles: </strong>{wine.quantity}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Listing status:</strong>
                                    </Typography>
                                    <ListingStatusSwitch sx={{ mb: 1 }}
                                        listingId={wine.listingId}
                                        currentStatus={wine.status}
                                        token={token}
                                        onStatusChange={(newStatus) =>
                                            setWines((prevWines) =>
                                                prevWines.map((w) =>
                                                    w.listingId === wine.listingId ? { ...w, status: newStatus } : w
                                                )
                                            )
                                        }
                                    />
                                    <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                                        <strong>Created: </strong>
                                        {new Date(wine.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary" >
                                        <strong>Last Updated: </strong>
                                        {new Date(wine.createdAt).toLocaleString()}
                                    </Typography>
                                </CardContent>

                                {/* Collapsible wine information */}
                                <Accordion sx={{
                                    padding: 1,
                                    margin: 1,
                                    marginBottom: 2,
                                    border: '1px solid #ddd',
                                    borderRadius: 1,
                                }}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                    >
                                        <Typography variant="h8">
                                            <strong>Wine Details:</strong>
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <WineData wine={wine.wineDetails} wineDetailPage={false} />
                                    </AccordionDetails>
                                </Accordion>

                                <Box display="flex" flexDirection="column" mt="auto">
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => {
                                            setCurrentListing(wine);
                                            setEditModalOpen(true);
                                        }}
                                        sx={{ mt: 2 }}
                                    >
                                        Edit listing
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            console.log(`Deleting listing with ID: ${wine.listingId}`);
                                            handleDeleteListing(wine.listingId);
                                        }}
                                        disabled={isDeleting}
                                        sx={{ mt: 1 }}
                                    >
                                        {isDeleting ? 'Removing...' : 'Remove listing'}
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    ))
                ) : (
                    <>
                        {loading ? (
                            <>
                                Loading...
                                <CircularProgress size={24} sx={{ ml: 2 }} />
                            </>
                        ) : (
                            'No wines found...'
                        )}
                    </>
                )}
            </Grid>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarMessage.includes('Failed') ? 'error' : 'success'}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Edit Listing Modal */}
            {currentListing && (
                <EditListingModal
                    open={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setCurrentListing(null);
                    }}
                    listingId={currentListing.listingId}
                    initialDetails={currentListing}
                    token={token}
                />
            )}

        </Container>
    );
};

export default ManageListings;
