// WineList.js
import React, { useState, useEffect } from 'react';
import './WineList.css'; // Ensure CSS file is correctly imported

const WineList = () => {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendURL = 'https://wine-scanner-backend-44824993784.europe-west1.run.app';
//  const backendURL = 'http://192.168.2.9:8080';

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const response = await fetch(`${backendURL}/get-wine-data`);
        const data = await response.json();
        setWines(data.wines);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wine data:', error);
        setLoading(false);
      }
    };

    fetchWines();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="wine-list-container">
      {/* <div className="wine-header">
        <h1>My Wine Cellar</h1>
      </div> */}
      <div className="wine-grid">
        {wines.map((wine, index) => (
          <div className="wine-card" key={index}>
            <img src={wine.imageUrl} alt={wine.name} className="wine-image" />
            <div className="wine-info">
              <h2 className="wine-name">{wine.name}</h2>
              <p><strong>Grape:</strong> {wine.grape}</p>
              <p><strong>Vintage:</strong> {wine.vintage}</p>
              <p><strong>Region:</strong> {wine.region}</p>
              <p><strong>Producer:</strong> {wine.producer}</p>
              <p><strong>Alcohol Content:</strong> {wine.alcoholContent}</p>
              <p><strong>Colour:</strong> {wine.colour}</p>
              <p><strong>Nose:</strong> {wine.nose}</p>
              <p><strong>Palate:</strong> {wine.palate}</p>
              <p><strong>Pairing:</strong> {wine.pairing}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WineList;
