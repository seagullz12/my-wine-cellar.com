import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { CardMedia, Typography, Box, Button, CircularProgress, Grid } from '@mui/material';
import AgeBadge from '../components/AgeBadge';
import PeakMaturityBadge from '../components/PeakMaturityBadge';
import WineData from '../components/WineData';
import WineBarIcon from '@mui/icons-material/WineBar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const UserWineCarousel = ({ wines }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wines.length > 0) {
      setLoading(false);
    }
  }, [wines]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,  // Set to show 3 smaller slides
    slidesToScroll: 1,
    responsive: [
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

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
        Your Wine Collection
      </Typography>

      <Slider {...settings}>
        {wines.map((wine) => (
          <Box key={wine.id} sx={{ padding: 1, textAlign: 'center', height: '400px', width: '250px' }}> {/* Set fixed height and width */}
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
                    <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} drinkingWindow={wine.drinkingWindow} round={true} />
                  )}
                </Box>
              </CardMedia>

              {/* Wine Information */}
              <Grid container spacing={1}>
                {/* Name */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <WineBarIcon color="primary" sx={{ mr: 2 }} />
                    <Typography textAlign="left">
                      <strong>Name:</strong> {wine.name}
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

                {/* Grape */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <WineBarIcon color="primary" sx={{ mr: 2 }} />
                    <Typography textAlign="left">
                      <strong>Grape:</strong> {wine.grape.join(', ')}
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
              <Box sx={{ mt: 0.5 }}>
                <Button variant="contained" color="primary" size="small" component={Link} to={`/cellar/${wine.id}`}>
                  View
                </Button>
              </Box>
            </Link>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default UserWineCarousel;
