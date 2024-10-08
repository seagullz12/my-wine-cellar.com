import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { CardMedia, Typography, Box, Button, CircularProgress, Grid, Card, Container } from '@mui/material';
import AgeBadge from './AgeBadge';
import PeakMaturityBadge from './PeakMaturityBadge';
import WineBarIcon from '@mui/icons-material/WineBar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { fetchMarketplaceListings } from '../components/api/marketplace';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { EuroRounded } from '@mui/icons-material';

const MarketWineCarousel = ({ token, sampleSize }) => {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchWineListings = async () => {
      if (token) {
        try {
          const data = await fetchMarketplaceListings(token, sampleSize);
          const fetchedWines = data || [];
          setWines(fetchedWines);
        } catch (error) {
          console.error('Error fetching wine data:', error);
          setError('Failed to load wines. Please try again later.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWineListings();
  }, [token, sampleSize]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 400,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If there was an error, show the error message
  if (error) {
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mb:4 }}>
      <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
        Other users are selling:
      </Typography>

      <Slider {...settings}>
        {wines.map((wine) => (
          <Card key={wine.listingId} sx={{ padding: 1, textAlign: 'center', minHeight: '550px'}}>
            <Link to={'/marketplace'} style={{ textDecoration: 'none' }}>
            <CardMedia
              sx={{
                position: 'relative',
                height: '300px',
                borderRadius: 2,
                overflow: 'hidden',
                marginBottom: 1,
              }}
            >
              <img
                src={wine.wineDetails.images?.front?.desktop || wine.wineDetails.images?.back?.desktop}
                alt={wine.wineDetails.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Box sx={{ position: 'absolute', top: 4, left: 4 }}>
                {!wine.wineDetails.drinkingWindow ? (
                  <AgeBadge vintage={wine.wineDetails.vintage} round={true} />
                ) : (
                  <PeakMaturityBadge
                    vintage={wine.wineDetails.vintage}
                    peakMaturity={wine.wineDetails.peakMaturity}
                    drinkingWindow={wine.wineDetails.drinkingWindow}
                    round={true}
                  />
                )}
              </Box>
            </CardMedia>

            {/* Wine Information */}
            <Container spacing={1} sx={{ p: 1 }}>
  <Grid item xs={12}>
      <Typography color="primary" textAlign="left">
        <strong>{wine.sellerDetails.userName}</strong> is selling:
      </Typography>
  </Grid>
  <Grid item xs={12}>
    <Box alignItems="center" sx={{ mb: 1 }}>
      <Typography textAlign="left">
        <strong> {wine.wineDetails.name}</strong>
      </Typography>
    </Box>
  </Grid>

  <Grid item xs={12}>
    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
      <EuroRounded color="primary" sx={{ mr: 1 }} />
      <Typography>
        <strong>Price:</strong> {wine.price}
      </Typography>
    </Box>
  </Grid>

  <Grid item xs={12}>
    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
      <WineBarIcon color="primary" sx={{ mr: 1 }} />
      <Typography>
        <strong>Colour:</strong> {wine.wineDetails.colour}
      </Typography>
    </Box>
  </Grid>

  <Grid item xs={12}>
    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
      <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
      <Typography>
        <strong>Vintage:</strong> {wine.wineDetails.vintage}
      </Typography>
    </Box>
  </Grid>
</Container>

            </Link>
          </Card>
        ))}
      </Slider>
    </Box>
  );
};

export default MarketWineCarousel;
