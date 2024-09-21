// Inside WineDetail.js
const renderAgeIndicator = () => {
    const agePercentage = Math.min((age / 10) * 100, 100); // Cap the percentage at 100
    return (
      <div className="age-indicator-container">
        <p>Age: {age} years</p>
        <div className="age-progress-bar">
          <div className="age-progress" style={{ width: `${agePercentage}%` }}></div>
        </div>
      </div>
    );
  };
  