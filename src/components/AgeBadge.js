import React from 'react';
import '../styles/AgeBadge.css'; // Ensure you have the styles

const AgeBadge = ({ vintage, round }) => {
  const calculateAge = (vintage) => {
    const vintageYear = parseInt(vintage, 10); // Convert to number
    const currentYear = new Date().getFullYear();
    return isNaN(vintageYear) ? 'N/A' : currentYear - vintageYear; // Handle invalid years
  };

  const age = calculateAge(vintage);

  return (
    <div className={round ? 'round-age-badge' : 'age-badge'}>
      <span className="age-text">{age} years old </span>
    </div>
  );
};

export default AgeBadge;