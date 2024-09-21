import React from 'react';
import '../styles/AgeTracker.css'; // For styling

const AgeTracker = ({ vintage = '' }) => {
  // Trim and parse vintage from string to number
  const vintageYear = parseInt(vintage.trim(), 10);

  // Check if the vintage is a valid number
  if (isNaN(vintageYear) || vintageYear < 1900 || vintageYear > new Date().getFullYear()) {
    return (
      <div className="age-tracker-container">
        <div className="age-visual invalid">
          <div className="age-number">N/A</div>
          <div className="age-label invalid">Invalid vintage</div>
        </div>
      </div>
    );
  }

  // Calculate the wine's age
  const currentYear = new Date().getFullYear();
  const age = currentYear - vintageYear;

  return (
    <div className="age-tracker-container">
      <div className="age-visual">
        <div className="age-number">{age}</div>
        <div className="age-label">years old</div>
      </div>
      <div className="age-description">
        This wine is <strong>{age} years old</strong>, harvested in {vintageYear}.
      </div>
    </div>
  );
};

export default AgeTracker;
