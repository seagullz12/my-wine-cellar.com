import React from 'react';
import '../styles/PeakMaturityBadge.css';

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
    <div className={round ? `round-peak-maturity-badge ${isAtPeak ? 'at-peak' : ''}`  : `peak-maturity-badge ${isAtPeak ? 'at-peak' : ''}`}>
      <span className="peak-maturity-text">
        {yearsUntilPeak > 0 
          ? `${yearsUntilPeak} years until peak` 
          : isAtPeak 
          ? 'At peak maturity' 
          : 'Already Peaked'}
      </span>
    </div>
  );
};

export default PeakMaturityBadge;
