import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import WineMap from './WineMap'; 
import PeakMaturityBadge from './PeakMaturityBadge';
import { Helmet } from 'react-helmet'; // Import Helmet

import '../styles/WineDetail.css';

const SharedWineDetail = () => {
  const { token } = useParams();
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';
  // const backendURL = 'http://192.168.2.9:8080';

  useEffect(() => {
    
    const fetchWineByToken = async () => {
      try {
        const response = await fetch(`${backendURL}/get-wine-by-token?token=${token}`);
        if (!response.ok) throw new Error('Failed to fetch wine');
    
        const result = await response.json();
        setWine(result.wine);
      } catch (error) {
        console.error('Error fetching wine by token:', error);
        setError('Error fetching wine data');
      } finally {
        setLoading(false); // Stop loading state here
      }
    };    

    fetchWineByToken();
  }, [token, wine]);
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="wine-detail-container">
      <div className="back-link" align="left">
        <Link to="/cellar" className="back-to-wine-list">Back to Your Cellar</Link>
      </div>
      {wine ? (
        <div className="wine-detail-card">
          <div className="wine-detail-header">
            <h1>{wine.name}</h1>
          </div>
          {wine.image.desktop && (
            <div className="wine-details-image-container">
              <img
              src={wine.image.desktop} // Default to desktop image
              srcSet={`${wine.image.mobile} 600w, ${wine.image.desktop} 1200w`}
                sizes="(max-width: 600px) 100vw, 1200px"
                alt={wine.name}
                className="wine-detail-image"
              />
              <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} round={false} /> 
            </div>
          )}
          <div className="wine-detail-info">
            <p><strong>Grape:</strong> {wine.grape}</p>
            <p><strong>Vintage:</strong> {wine.vintage}</p>
            <p><strong>Region:</strong> {wine.region}</p>
            <p><strong>Producer:</strong> {wine.producer}</p>
            <p><strong>Alcohol Content:</strong> {wine.alcohol}</p>
            <p><strong>Quality Classification:</strong> {wine.classification}</p>
            <p><strong>Colour:</strong> {wine.colour}</p>
            <p><strong>Nose:</strong> {wine.nose}</p>
            <p><strong>Palate:</strong> {wine.palate}</p>
            <p><strong>Pairing:</strong> {wine.pairing}</p>
            <p><strong>Peak Maturity:</strong> {wine.peakMaturity}</p>
            {/* Map of Wine Region */}
            <WineMap region={wine.region} />
          </div>
        </div>
      ) : (
        <p>Wine data not found</p>
      )}
    </div>
  );
};

export default SharedWineDetail;
