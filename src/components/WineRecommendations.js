import React, { useState } from 'react';
import '../styles/WineRecommendations.css'; // Ensure you have this CSS file in the same folder
import { getAuth } from 'firebase/auth'; // Firebase authentication

const WineRecommendation = () => {
  const [food, setFood] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app'; // prod
 // const backendURL = 'http://192.168.2.9:8080'; // dev

  // Function to get the Firebase Auth token
  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get Firebase auth token
      const token = await getToken();
      if (!token) {
        throw new Error('User not authenticated.');
      }

      // Fetch recommendations from the backend
      const response = await fetch(`${backendURL}/recommend-wine`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Pass token in Authorization header
        },
        body: JSON.stringify({ food }) // Send the food input as request body
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations from server.');
      }

      const data = await response.json();
      
      // Parse the JSON response to display recommendations
      const parsedRecommendations = JSON.parse(data.recommendations);
      setRecommendations(parsedRecommendations);
    } catch (err) {
      setError(err.message || 'Failed to get recommendations.');
      console.error('Error:', err);
    }
    setLoading(false);
  };

  // Function to format recommendations into JSX
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
