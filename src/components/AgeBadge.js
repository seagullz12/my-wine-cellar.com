import React from 'react';
import { Box, Typography } from '@mui/material';

const AgeBadge = ({ vintage, round }) => {
  const calculateAge = (vintage) => {
    const vintageYear = parseInt(vintage, 10); // Convert to number
    const currentYear = new Date().getFullYear();
    return isNaN(vintageYear) ? 'N/A' : currentYear - vintageYear; // Handle invalid years
  };

  const age = calculateAge(vintage);

  return (
    <Box
    sx={{
      backgroundColor: '#6c757d', // Optional background for better contrast
      opacity: '70%',
      padding: 1,
      display: 'inline-block',
    }}
    >
      <Typography
        variant="body2"
        component="span"
        sx={{
          color: 'primary.contrastText',
          fontWeight: 'bold',
        }}
      >
        {age} years old
      </Typography>
    </Box>
  );
};

export default AgeBadge;
