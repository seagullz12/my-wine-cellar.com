import React from 'react';
import { Box, Typography } from '@mui/material';

const PeakMaturityBadge = ({ vintage, peakMaturity, round }) => {
  if (!peakMaturity) return null;

  const calculateYearsUntilPeak = (vintage, peakMaturity) => {
    const vintageYear = parseInt(vintage, 10);
    const currentYear = new Date().getFullYear();
    const yearsOld = currentYear - vintageYear;

    if (isNaN(vintageYear) || isNaN(peakMaturity)) {
      return 'N/A';
    }

    const yearsUntilPeak = peakMaturity - yearsOld;
    return yearsUntilPeak;
  };

  const yearsUntilPeak = calculateYearsUntilPeak(vintage, peakMaturity);
  const isAtPeak = yearsUntilPeak === 0;

  return (
    <Box
      sx={{
        backgroundColor: isAtPeak ? '#800020' : '#6c757d', // Optional background for better contrast
        opacity: '70%',
        padding: 1,
        display: 'inline-block',
      }}
    >
      <Typography
        variant="body2"
        component="span"
        sx={{
          color: isAtPeak ? 'success.contrastText' : 'warning.contrastText',
          fontWeight: 'bold',
        }}
      >
        {yearsUntilPeak > 0 
          ? `${yearsUntilPeak} year${yearsUntilPeak>1 ? 's' : ''} until peak` 
          : isAtPeak 
          ? 'At peak maturity' 
          : 'Already Peaked'}
      </Typography>
    </Box>
  );
};

export default PeakMaturityBadge;
