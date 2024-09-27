// src/utils/MaturityUtils.js
export const calculateMaturityStatus = (vintage, drinkingWindow) => {
  // Check if drinkingWindow is undefined or doesn't have the required properties
  if (!drinkingWindow || typeof drinkingWindow.lower === 'undefined' || typeof drinkingWindow.upper === 'undefined') {
      return {
          badgeText: '',
          backgroundColor: 'transparent',
          tooltipText: '',
      };
  }

  const currentYear = new Date().getFullYear();
  const lowerBoundary = parseInt(drinkingWindow.lower, 10);
  const upperBoundary = parseInt(drinkingWindow.upper, 10);
  const vintageYear = parseInt(vintage, 10);


  const yearsUntilOptimalStart = lowerBoundary - currentYear;
  const yearsUntilPeakEnd = upperBoundary - currentYear;

  const isInDrinkingWindow = currentYear >= lowerBoundary && currentYear <= upperBoundary;
  const hasAlreadyPeaked = currentYear > upperBoundary;
  const approachingPeak = currentYear < lowerBoundary;

  const earlyMaturityBuffer = 1;  // Define early maturity buffer
  const lateMaturityBuffer = 1;   // Define late maturity buffer

  const isEarlyMaturity = currentYear === lowerBoundary || (currentYear > lowerBoundary && currentYear <= lowerBoundary + earlyMaturityBuffer);
  const isLateMaturity = currentYear === upperBoundary || (currentYear < upperBoundary && currentYear >= upperBoundary - lateMaturityBuffer);
  const isAtPeakMaturity = !isEarlyMaturity && !isLateMaturity && isInDrinkingWindow;

  if (isInDrinkingWindow) {
    if (isEarlyMaturity) {
      return {
        badgeText: 'Early Maturity',
        backgroundColor: '#ffc107', // Yellow for early maturity
        tooltipText: 'This wine is in the early stages of its optimal drinking window.',
      };
    } else if (isLateMaturity) {
      return {
        badgeText: 'Late Maturity',
        backgroundColor: '#ff8c00', // Orange for late maturity
        tooltipText: 'This wine is nearing the end of its optimal drinking window.',
      };
    } else if (isAtPeakMaturity) {
      return {
        badgeText: 'At Peak Maturity',
        backgroundColor: '#28a745', // Green for peak maturity
        tooltipText: 'This wine is at its peak maturity and ideal for drinking.',
      };
    }
  } else if (approachingPeak) {
    return {
      badgeText: `${yearsUntilOptimalStart} year${yearsUntilOptimalStart > 1 ? 's' : ''} until peak`,
      backgroundColor: 'grey', // Grey for approaching peak
      tooltipText: `This wine will reach its optimal drinking window in ${yearsUntilOptimalStart} year${yearsUntilOptimalStart > 1 ? 's' : ''}.`,
    };
  } else if (hasAlreadyPeaked) {
    return {
      badgeText: 'Already Peaked',
      backgroundColor: '#dc3545', // Red for already peaked
      tooltipText: 'This wine has already peaked and may no longer be at its best.',
    };
  }

  return null;
};