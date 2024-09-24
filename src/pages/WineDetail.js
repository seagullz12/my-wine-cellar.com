import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, Link } from 'react-router-dom';
import WineDetailEditForm from '../components/WineDetailEditForm';
import WineMap from '../components/WineMap';
import PeakMaturityBadge from '../components/PeakMaturityBadge';
import ShareWineButton from '../components/ShareWineButton';
import TastingNotesForm from '../components/TastingNotesForm';
import { getWineIdFromToken } from '../components/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

//import 'swiper/swiper-bundle.css'; // Correct Swiper styles import
//import '../styles/WineDetail.css'; // Import your custom styles

import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  IconButton,
  Card, 
  CardContent, 
  CardActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const WineDetail = () => {
  const { id: wineId, token } = useParams(); // Directly use the wineId from params
  const [user, setUser] = useState(null);
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tastingStarted, setTastingStarted] = useState(false);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchWineData = async () => {
      const resolvedWineId = token ? await getWineIdFromToken(token) : wineId;

      if (user && resolvedWineId) {
        try {
          const authToken = await user.getIdToken();
          const response = await fetch(`${backendURL}/get-wine-data?id=${resolvedWineId}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            setWine(result.wine);
            setFormData(result.wine);
          } else {
            setError('Error fetching wine data');
          }
        } catch (error) {
          setError('An error occurred while fetching wine data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWineData();
  }, [wineId, user, token]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${backendURL}/update-wine-data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: wineId, wineData: formData }),
      });

      if (response.ok) {
        const updatedWine = await response.json();
        setWine(updatedWine.data);
        setIsEditing(false);
        setSuccessMessage('Wine details saved successfully!');
        setSnackbarOpen(true);
      } else {
        setError('Error updating wine data');
      }
    } catch (error) {
      setError('An error occurred while updating wine data');
    }
  };

  const handleTastingStarted = (updatedWine) => {
    setWine(updatedWine);
    setTastingStarted(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  
  const spacingValue = 1.5; // You can adjust this value to control spacing
  return (
    <Box sx={{ padding: 0, maxWidth: 800, margin: '0 auto' }}>
<Box display="flex" justifyContent="flex-start" alignItems="center" sx={{ mt: 2 }}>
  <Link to="/cellar" style={{ textDecoration: 'none' }}>
    <Button 
      variant="text" 
      color="text.primary" 
      startIcon={<ArrowBackIcon />} 
      sx={{ 
        textTransform: 'none', 
        fontWeight: 'bold',
        '&:hover': {
          backgroundColor: 'primary.light', 
          textDecoration: 'underline',
        } 
      }}
    >
      Back to Cellar
    </Button>
  </Link>
</Box>
      
      {wine ? (
        <Box sx={{ 
          borderRadius: 2, 
          padding: 2, 
          }}>

          {/* Swiper Carousel for Front and Back Images */}
          <Card sx={{ backgroundColor: '#F5F5F5'}}>
          {/* Header for Wine Name */}
        <Box sx={{backgroundColor:"#8b3a3a"}}>
          <Typography variant="h4" component="h1" sx={{ padding: 2, textAlign: "center" }}>
          {wine.name}
        </Typography>
        </Box>
          <CardContent sx={{padding:0}}>
          {wine.images && (
              <Box sx={{backgroundColor:"#8b3a3a"}}>
              <Swiper
                modules={[Navigation, Pagination]} // Pass the modules to the Swiper
                spaceBetween={10}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                style={{
                  "--swiper-pagination-color": "#8b3a3a",
                  "--swiper-pagination-bullet-inactive-color": "#fff",
                  "--swiper-pagination-bullet-inactive-opacity": "1",
                  "--swiper-navigation-color":"#fff"  
                }}
              >
                {wine.images.front?.desktop && (
                  <SwiperSlide>
                    <Box position="relative">
                      <img
                        src={wine.images.front.desktop}
                        srcSet={`${wine.images.front.mobile} 600w, ${wine.images.front.desktop} 1200w`}
                        sizes="(max-width: 600px) 100vw, 1200px"
                        alt={`${wine.name} front image`}
                        style={{ width: '100%', borderRadius: '0px' }}
                      />
                      {/* Position the PeakMaturityBadge absolutely within the Box */}
                      <Box
                        position="absolute"
                        bottom={20} // Adjust this value to position the badge vertically
                        left={10} // Adjust this value to position the badge horizontally
                        zIndex={1} // Ensure the badge appears above the image
                         sx={{padding:0}}
                      >
                        <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} round={false} />
                      </Box>
                    </Box>
                  </SwiperSlide>
                )}
                {wine.images.back?.desktop && (
                  <SwiperSlide>
                  <Box position="relative">
                    <img
                      src={wine.images.back.desktop}
                      srcSet={`${wine.images.back.mobile} 600w, ${wine.images.back.desktop} 1200w`}
                      sizes="(max-width: 600px) 100vw, 1200px"
                      alt={`${wine.name} back image`}
                      style={{ width: '100%', borderRadius: '0px' }}
                    />
                    {/* Position the PeakMaturityBadge absolutely within the Box */}
                    <Box
                        position="absolute"
                        bottom={20} // Adjust this value to position the badge vertically
                        left={10} // Adjust this value to position the badge horizontally
                        zIndex={1} // Ensure the badge appears above the image
                         sx={{padding:0}}
                    >
                      <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} round={false} />
                    </Box>
                  </Box>
                </SwiperSlide> 
                )}
              </Swiper>
              </Box>

          )}

          {/* Success Notification Snackbar */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message={successMessage}
            action={
              <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          />

          {/* Wine Details Card */}
              {isEditing ? (
                <WineDetailEditForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  handleEditToggle={handleEditToggle}
                />
              ) : (
                <>
                  {!tastingStarted && (
                   <Box sx={{ 
                    padding: 2,
                    margin: 1
                    }}>
                     <Typography sx={{ mb: spacingValue }}><strong>Grape:</strong> {wine.grape}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Vintage:</strong> {wine.vintage}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Region:</strong> {wine.region}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Producer:</strong> {wine.producer}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Alcohol Content:</strong> {wine.alcohol}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Quality Classification:</strong> {wine.classification}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Colour:</strong> {wine.colour}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Nose:</strong> {wine.nose}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Palate:</strong> {wine.palate}</Typography>
                     <Typography sx={{ mb: spacingValue }}><strong>Pairing:</strong> {wine.pairing}</Typography>
                     <Typography sx={{ mb: 0 }}><strong>Peak Maturity:</strong> {wine.peakMaturity} years after harvest</Typography>
                   </Box>
                  )}
                     
                  <CardActions>
                  {!tastingStarted && (
                    <Box sx={{ display: 'flex', gap: 1, margin: 1, padding: 1 }}>
                      <Button variant="contained" color="primary" onClick={handleEditToggle}>Edit Details</Button>
                      <Button variant="contained" color="primary" onClick={handleTastingStarted}>Start Tasting</Button>
                      <ShareWineButton wineName={wine.name} wineId={wineId} />
                    </Box>
              )}
                  </CardActions>
                  {!tastingStarted && (
                  <Box sx={{ alignItems: "center", margin: 2, padding: 1 }}>
                  <WineMap region={wine.region} />
                  </Box>
                )}
                </>
              )}
              {tastingStarted && (
                <TastingNotesForm
                  wineId={wineId}
                  backendURL={backendURL}
                  user={user}
                />
              )}
            </CardContent>
            </Card>
        </Box>
      ) : (
        <Typography color="error">Wine data not found</Typography>
      )}
    </Box>
  );
};

export default WineDetail;
