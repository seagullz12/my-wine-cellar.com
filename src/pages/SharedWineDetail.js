import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import WineMap from '../components/WineMap'; 
import PeakMaturityBadge from '../components/PeakMaturityBadge';

//swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// ga4 (analytics)
import ReactGA from 'react-ga4';

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

const SharedWineDetail = () => {
  const { token } = useParams();
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation(); // ga4 tracking

    const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';
  // const backendURL = 'http://192.168.2.9:8080';
  
  useEffect(() => {
    if (wine) {
      // Use wine's name and other details to provide more context
      ReactGA.send({
        hitType: 'pageview',
        page: `/cellar/shared-wine-detail`,  // You can replace this with a slug or wine-specific identifier
        title: `Shared Wine Detail - ${wine.name} (${wine.vintage})`,
      }); 
    }
  }, [wine, location]);


  useEffect(() => {
    const fetchWineByToken = async () => {
      try {
        const response = await fetch(`${backendURL}/get-wine-by-token?token=${token}`);
        if (!response.ok) throw new Error('Failed to fetch wine');
    
        const result = await response.json();
        setWine(result.wine);
      } catch (error) {
        console.error('Error fetching wine by token:', error);
        setError('Error fetching wine data');
      } finally {
        setLoading(false); // Stop loading state here
      }
    };    

    fetchWineByToken();
  }, [token, wine]);
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

const spacingValue = 1.5;
    return (
      <Box sx={{ padding: 0, maxWidth: 800, margin: '0 auto' }}>
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
            {/* Wine Details Card */}
                     <Box sx={{ 
                      padding: 2,
                      margin: 1,
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
                       <Typography sx={{ mb: spacingValue }}>{wine.peakMaturity ? (<><strong>Peak Maturity:</strong> {`${wine.peakMaturity} years after harvest`}</>) : null}</Typography>
                       <Typography sx={{ mb: spacingValue }}>{wine.description ? (<><strong>Description:</strong> {wine.description} </>) : null}</Typography>
                     </Box>
                    <Box sx={{ alignItems: "center", margin: 2, padding: 1 }}>
                    <WineMap region={wine.region} />
                    </Box>
              </CardContent>
              </Card>
          </Box>
        ) : (
          <Typography color="error">Wine data not found</Typography>
        )}
      </Box>
    );
  };

export default SharedWineDetail;
