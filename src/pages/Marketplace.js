import React, { useState, useEffect } from 'react';
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
    Dialog,
    DialogContent
} from '@mui/material';
import AgeBadge from '../components/AgeBadge';
import PeakMaturityBadge from '../components/PeakMaturityBadge';
import WineListSorting from '../components/WineListSorting';
import WineData from '../components/WineData';
import ForSaleLabel from '../components/ForSaleLabel';
import { fetchMarketplaceListings } from '../components/api/marketplace';
import BuyWineForm from '../components/BuyWineForm'; // Import BuyWineForm component

const Marketplace = () => {
    const [wines, setWines] = useState([]);
    const [filteredWines, setFilteredWines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [sortCriteria, setSortCriteria] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [dialogOpen, setDialogOpen] = useState(false); // Dialog state
    const [selectedWine, setSelectedWine] = useState(null); // Store selected wine for modal
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        colours: ['Red', 'White', 'Rosé', 'Green', 'Orange', 'Sparkling'],
        grapes: [
            "Cabernet Sauvignon",
            "Merlot",
            "Pinot Noir",
            "Syrah (Shiraz)",
            "Zinfandel",
            "Chardonnay",
            "Sauvignon Blanc",
            "Riesling",
            "Malbec",
            "Tempranillo",
            "Grenache",
            "Cabernet Franc",
            "Sangiovese",
            "Mourvèdre",
            "Viognier",
            "Pinot Grigio (Pinot Gris)",
            "Semillon",
            "Nebbiolo",
            "Barbera",
            "Touriga Nacional",
            "Petit Verdot",
            "Chenin Blanc",
            "Garganega",
            "Grüner Veltliner",
            "Fiano",
            "Albariño",
            "Vermentino",
            "Nero d'Avola",
            "Carignan",
            "Dolcetto",
            "Aglianico",
            "Carmenère",
            "Primitivo",
            "Moscato",
            "Torrontés",
            "Saint Laurent",
            "Tannat",
            "Cinsault"
        ],
        vintages: [],
        names: [],
        datesAdded: [],
        statuses: ['in_cellar', 'consumed', "for_sale"],
        countries: [],
    });

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Fetch marketplace listings
    useEffect(() => {
        const fetchWineListings = async () => {
            if (user) {
                try {
                    const token = await user.getIdToken();
                    setToken(token);
                    const data = await fetchMarketplaceListings(token);

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
        };

        fetchWineListings();
    }, [user]);

    // Filter and sort wines based on user selection
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        const filtered = wines.filter(wine =>
            (!newFilters.colours.length || newFilters.colours.some(colour => wine.wineDetails.colour.toLowerCase().includes(colour.toLowerCase()))) &&
            (!newFilters.grapes.length || newFilters.grapes.some(grape => wine.wineDetails.grape.toLowerCase().includes(grape.toLowerCase()))) &&
            (!newFilters.vintages.length || newFilters.vintages.includes(wine.wineDetails.vintage)) &&
            (!newFilters.countries.length || newFilters.countries.includes(wine.wineDetails.country)) &&
            (!newFilters.statuses.length || newFilters.statuses.includes(wine.wineDetails.status))
        );

        const sortedFilteredWines = sortWines(filtered);
        setFilteredWines(sortedFilteredWines);
    };

    const handleResetFilters = () => {
        setFilteredWines(wines);
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

    const handleSortChange = (event) => {
        const { value } = event.target;
        setSortCriteria(value);
        const sortedWines = sortWines(filteredWines);
        setFilteredWines(sortedWines);
    };

    const handleSortOrderChange = () => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
        const sortedWines = sortWines(filteredWines);
        setFilteredWines(sortedWines);
    };

    // Open the BuyWineForm modal
    const handleBuyClick = (wine) => {
        setSelectedWine(wine);
        setDialogOpen(true); // Open dialog when "Buy" is clicked
    };

    // Close the modal
    const handleDialogClose = () => {
        setSelectedWine(null);
        setDialogOpen(false);
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (!user) {
        return <Typography>Please log in to see the marketplace.</Typography>;
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
                                <Link to={`/cellar/${wine.wineId}`}>
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
                                    <Typography variant="body1" sx={{ m: 2, mb: 1 }}><strong>{wine.wineDetails.name}</strong></Typography>
                                    <Typography variant="body1" sx={{ m: 2, mb: 1 }} color="primary">
                                        {wine.sellerDetails.userName} is selling {wine.quantity > 1 ? (
                                            <><strong>{wine.quantity} </strong> bottles for <strong>€{wine.price}</strong> each</>
                                        ) : (
                                            <><strong>{wine.quantity} </strong> bottle for <strong>€{wine.price}</strong></>
                                        )}
                                    </Typography>
                                </Link>
                                <CardContent sx={{
                                    padding: 0,
                                    margin: 1,
                                    marginBottom: 2
                                }}>
                                    <WineData wine={wine.wineDetails} wineDetailPage={false} />
                                </CardContent>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleBuyClick(wine)} 
                                    >
                                        Buy
                                    </Button>
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

            {/* BuyWineForm Dialog */}
            {selectedWine && (
                <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
                    <DialogContent>
                        <BuyWineForm
                            wine={selectedWine}
                            wineId={selectedWine.id}
                            user={user}
                            token={token}
                            onClose={handleDialogClose}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </Container>
    );
};

export default Marketplace;
