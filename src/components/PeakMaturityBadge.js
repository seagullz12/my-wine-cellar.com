// src/components/WineBadge.js

import React from 'react';
import { calculateMaturityStatus } from '../components/utils/MaturityUtils'; // Import the utility function
import { Chip, Tooltip } from '@mui/material';

const PeakMaturityBadge = ({ vintage, drinkingWindow }) => {
  const maturityStatus = calculateMaturityStatus(vintage, drinkingWindow);

  if (!maturityStatus) return null;

  return (
    <Tooltip title={maturityStatus.tooltipText}>
      <Chip
        label={maturityStatus.badgeText}
        style={{ opacity: '70%', backgroundColor: maturityStatus.backgroundColor, color: '#fff' }}
      />
    </Tooltip>
  );
};

export default PeakMaturityBadge;