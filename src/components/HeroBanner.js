import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import headerBackground from '../assets/images/hero_banner.jpg'; // Your background image

const HeroBanner = ({ isLoggedIn }) => {
  return (
    <Box
      sx={{
        backgroundImage: `url(${headerBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '35vh', // Reduced height for subtlety
        display: 'flex',
        borderRadius: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8, // Reduce the opacity for a softer appearance
        color: 'white',
        padding: 2,
        position: 'relative',
      }}
    >
      {/* Optional Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent black overlay
          borderRadius: 1,
        }}
      />
      <Typography
        variant="h4"
        component="h1"
        sx={{ textAlign: 'center', fontSize: '2rem', fontWeight: '300', zIndex: 1 }}
      >
        Treasure your favorite wines with ease
      </Typography>

      {!isLoggedIn ? (
        <Button href="/#/sign-up" variant="outlined" color="inherit" sx={{ marginTop: 2 }}>
          Get Started
        </Button>
      ) : (
        <Button href="/#/cellar" variant="outlined" color="inherit" sx={{ marginTop: 2 }}>
          Go to Cellar
        </Button>
      )}
    </Box>
  );
};

export default HeroBanner;
