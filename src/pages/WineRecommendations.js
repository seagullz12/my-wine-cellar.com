import React, { useState } from 'react';
import '../styles/WineRecommendations.css'; // Ensure CSS is in the same folder
import { getAuth } from 'firebase/auth'; // Firebase authentication

const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app'; // prod

const WineRecommendation = () => {
  const [food, setFood] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get Firebase Auth token
  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    return user ? user.getIdToken() : null;
  };

  // Fetch wine recommendations from backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('User not authenticated.');

      const response = await fetch(`${backendURL}/recommend-wine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ food }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations from the server.');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wine-recommendation-container">
      <form onSubmit={handleSubmit} className="recommendation-form">
        <label className="form-label">
          <h3>Hi! I am your personal sommelier.</h3>
          <p>Enter your food, and I'll find the best wine pairing from your cellar:</p>
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

      {/* Loading State */}
      {loading && <p>Loading recommendations...</p>}

      {/* Error State */}
      {error && <p className="error-message">{error}</p>}

      {/* Recommendations */}
      {recommendations && (
        <div className="recommendations-list">
          {['Best', 'Second_best', 'Third_best'].map((rank) => (
            <div key={rank} className="recommendation-item">
              <h3>{rank.replace('_', ' ')} Pairing</h3>
              <p>
                <strong>Name:</strong>{' '}
                <a href={"https://www.my-wine-cellar.com/#" + recommendations[`${rank}_pairing_link`]} target="_blank" rel="noreferrer">
                  {recommendations[`${rank}_pairing_name`]}
                </a>
              </p>
              <p><strong>Explanation:</strong> {recommendations[`${rank}_pairing_explanation`]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WineRecommendation;
