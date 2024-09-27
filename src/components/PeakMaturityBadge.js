import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

const PeakMaturityBadge = ({ vintage, drinkingWindow }) => {
  if (!drinkingWindow || !drinkingWindow.lower || !drinkingWindow.upper) return null;

  const currentYear = new Date().getFullYear();
  
  // Parse the drinking window and vintage
  const lowerBoundary = parseInt(drinkingWindow.lower, 10);
  const upperBoundary = parseInt(drinkingWindow.upper, 10);
  const vintageYear = parseInt(vintage, 10);

  if (isNaN(vintageYear) || isNaN(lowerBoundary) || isNaN(upperBoundary)) {
    return null; // Exit if values are invalid
  }

  const yearsUntilOptimalStart = lowerBoundary - currentYear;
  const yearsUntilPeakEnd = upperBoundary - currentYear;

  const isInDrinkingWindow = currentYear >= lowerBoundary && currentYear <= upperBoundary;
  const hasAlreadyPeaked = currentYear > upperBoundary;
  const approachingPeak = currentYear < lowerBoundary;

  const earlyMaturityBuffer = 1;  // Define early maturity buffer (e.g., 1 year after lower boundary)
  const lateMaturityBuffer = 1;   // Define late maturity buffer (e.g., 1 year before upper boundary)

  // Conditions for early, peak, and late maturity
  const isEarlyMaturity = currentYear === lowerBoundary || (currentYear > lowerBoundary && currentYear <= lowerBoundary + earlyMaturityBuffer);
  const isLateMaturity = currentYear === upperBoundary || (currentYear < upperBoundary && currentYear >= upperBoundary - lateMaturityBuffer);
  const isAtPeakMaturity = !isEarlyMaturity && !isLateMaturity && isInDrinkingWindow;

  let badgeText = '';
  let backgroundColor = '';
  let tooltipText = ''; // Text for the tooltip

  if (isInDrinkingWindow) {
    if (isEarlyMaturity) {
      badgeText = 'Early Maturity';
      backgroundColor = '#ffc107'; // Yellow for early maturity
      tooltipText = 'This wine is in the early stages of its optimal drinking window.';
    } else if (isLateMaturity) {
      badgeText = 'Late Maturity';
      backgroundColor = '#ff8c00'; // Darker orange for late maturity
      tooltipText = 'This wine is nearing the end of its optimal drinking window.';
    } else if (isAtPeakMaturity) {
      badgeText = 'At Peak Maturity';
      backgroundColor = '#28a745'; // Success green for peak maturity
      tooltipText = 'This wine is at its peak maturity and ideal for drinking.';
    }
  } else if (approachingPeak) {
    badgeText = `${yearsUntilOptimalStart} year${yearsUntilOptimalStart > 1 ? 's' : ''} until peak`;
    backgroundColor = 'grey'; // Info blue for approaching peak
    tooltipText = `This wine will reach its optimal drinking window in ${yearsUntilOptimalStart} year${yearsUntilOptimalStart > 1 ? 's' : ''}.`;
  } else if (hasAlreadyPeaked) {
    badgeText = 'Already Peaked';
    backgroundColor = '#dc3545'; // Danger red for wines that have passed peak
    tooltipText = 'This wine has already peaked and may no longer be at its best.';
  }

  return (
    <Tooltip title={tooltipText} arrow>
      <Box
        sx={{
          backgroundColor,
          opacity: '70%',
          padding: 1,
          display: 'inline-block',
          borderRadius: '4px', // Add some rounding to the badge
          cursor: 'help', // Change cursor to indicate hover for help
        }}
      >
        <Typography
          variant="body2"
          component="span"
          sx={{
            color: 'white', // Ensure text is visible regardless of background color
            fontWeight: 'bold',
          }}
        >
          {badgeText}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default PeakMaturityBadge;
