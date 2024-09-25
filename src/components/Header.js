import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import headerBackground from '../assets/images/other.webp'; // Import your background image
import '../styles/Header.css'; // Import CSS for the header styling

const Header = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: '300px', md: '400px' }, // Responsive height
        backgroundImage: `url(${headerBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white', // Text color
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
        Discover Your Perfect Wine
      </Typography>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Manage and explore your favorite wines with ease.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        href="/" 
        sx={{ borderRadius: '20px', px: 4 }}
      >
        Get Started
      </Button>
    </Box>
  );
};

export default Header;
