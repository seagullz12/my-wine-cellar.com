// src/components//PeakMaturityBadge.js
import React from 'react';
import { calculateMaturityStatus } from '../components/utils/MaturityUtils';
import { Chip, Tooltip } from '@mui/material';

const PeakMaturityBadge = ({ drinkingWindow }) => {
  const maturityStatus = calculateMaturityStatus(drinkingWindow);

  if (!maturityStatus) return null;

  return (
    <Tooltip title={maturityStatus.tooltipText}>
      <Chip
        label={maturityStatus.maturityStatus}
        style={{ opacity: '80%', backgroundColor: maturityStatus.backgroundColor, color: '#fff' }}
      />
    </Tooltip>
  );
};

export default PeakMaturityBadge;