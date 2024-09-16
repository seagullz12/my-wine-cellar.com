import React, { useState } from 'react';
import './WineRecommendations.css'; // Ensure you have this CSS file in the same folder

const WineRecommendation = () => {
  const [food, setFood] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const backendURL = 'https://wine-scanner-backend-44824993784.europe-west1.run.app';
  // const backendURL = 'http://192.168.2.9:8080';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendURL}/recommend-wine`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food })
      });
      const data = await response.json();
      // Parse the JSON response
      const parsedRecommendations = JSON.parse(data.recommendations);
      setRecommendations(parsedRecommendations);
    } catch (err) {
      setError('Failed to get recommendations');
      console.error('Error:', err);
    }
    setLoading(false);
  };

  // Function to parse and format recommendations
  const formatRecommendations = (data) => {
    if (!data) return null;

    return (
      <div className="recommendations-list">
        <div className="recommendation-item">
          <h3>Best Pairing</h3>
          <p><strong>Name:</strong> {data.best_pairing_name}</p>
          <p><strong>Explanation:</strong> {data.best_pairing_explanation}</p>
        </div>
        <div className="recommendation-item">
          <h3>Second Best Pairing</h3>
          <p><strong>Name:</strong> {data.second_best_pairing_name}</p>
          <p><strong>Explanation:</strong> {data.second_best_pairing_explanation}</p>
        </div>
        <div className="recommendation-item">
          <h3>Third Best Pairing</h3>
          <p><strong>Name:</strong> {data.third_best_pairing_name}</p>
          <p><strong>Explanation:</strong> {data.third_best_pairing_explanation}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="wine-recommendation-container">
      <form onSubmit={handleSubmit} className="recommendation-form">
        <label className="form-label">
          <h3>Hi! I am your personal sommelier.</h3> 
          <br />Enter your food and I'll find the best wine pairing from your cellar:
          <input
            type="text"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            required
            className="form-input"
          />
        </label>
        <button type="submit" className="form-button" disabled={loading}>
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </form>
      {recommendations && formatRecommendations(recommendations)}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default WineRecommendation;
