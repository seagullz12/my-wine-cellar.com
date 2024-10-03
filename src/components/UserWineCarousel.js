import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { CardMedia, Typography, Box, Button, CircularProgress, Grid, Card } from '@mui/material';
import AgeBadge from './AgeBadge';
import PeakMaturityBadge from './PeakMaturityBadge';
import WineBarIcon from '@mui/icons-material/WineBar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {fetchUserWines} from '../components/api/wines'

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const UserWineCarousel = ({ token, sampleSize  }) => {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWines = async () => {
      if (token) {
        try {
          const data = await fetchUserWines(token);
          const fetchedWines = data.wines || [];
          setWines(fetchedWines.slice(0, sampleSize)); // Limit to sample size
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

    fetchWines();
  }, [token, sampleSize]);


  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 6, // Set to show 3 smaller slides
    slidesToScroll: 1,
    appendDots: (dots) => (
      <div style={{  marginBottom: "18px" }}> {/* Add margin here */}
        <ul style={{ display: 'flex', justifyContent: 'center'}}>
          {dots}
        </ul>
      </div>
    ),
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 6,
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
    return <CircularProgress />;
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

  // If no wines are present, show a message to add wines
  if (wines.length === 0) {
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          No wines found in your collection.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          It looks like you haven't added any wines yet.
        </Typography>
        <Button variant="contained" color="primary" component={Link} to="/add-wine">
          Add Wine
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, mt:4, textAlign: 'center' }}>
        Your Wine Collection:
      </Typography>

      <Slider {...settings}>
        {wines.map((wine) => (
          <Card key={wine.id} sx={{ padding: 1, textAlign: 'center', minHeight: '450px' }}>
            <Link to={`/cellar/${wine.id}`} style={{ textDecoration: 'none' }}>
              <CardMedia
                sx={{
                  position: 'relative',
                  height: '200px', // Fixed height for the image
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginBottom: 1,
                }}
              >
                <img
                  src={wine.images?.front?.desktop || wine.images?.back?.desktop}
                  alt={wine.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} // Maintain aspect ratio
                />
                <Box sx={{ position: 'absolute', top: 4, left: 4 }}>
                  {!wine.drinkingWindow ? (
                    <AgeBadge vintage={wine.vintage} round={true} />
                  ) : (
                    <PeakMaturityBadge
                      vintage={wine.vintage}
                      peakMaturity={wine.peakMaturity}
                      drinkingWindow={wine.drinkingWindow}
                      round={true}
                    />
                  )}
                </Box>
              </CardMedia>

              {/* Wine Information */}
              <Grid container spacing={1}>
                {/* Name */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <Typography textAlign="center">
                      <strong>{wine.name}</strong>
                    </Typography>
                  </Box>
                </Grid>

                {/* Colour */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <WineBarIcon color="primary" sx={{ mr: 2 }} />
                    <Typography textAlign="left">
                      <strong>Colour:</strong> {wine.colour}
                    </Typography>
                  </Box>
                </Grid>

                {/* Vintage */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <CalendarTodayIcon color="primary" sx={{ mr: 2 }} />
                    <Typography textAlign="left">
                      <strong>Vintage:</strong> {wine.vintage}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* View Button */}
              <Box sx={{ m: 1 }}>
                <Button variant="contained" color="primary" size="small" component={Link} to={`/cellar/${wine.id}`}>
                  View
                </Button>
              </Box>
            </Link>
          </Card>
        ))}
      </Slider>
    </Box>
  );
};

export default UserWineCarousel;
