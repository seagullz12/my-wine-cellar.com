import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWineIdFromToken } from './utils'; // Your token decoding function
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import WineMap from './WineMap'; 
import AgeBadge from './AgeBadge';
import PeakMaturityBadge from './PeakMaturityBadge';
import '../styles/WineDetail.css';

const SharedWineDetail = () => {
  const { token } = useParams();
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWine = async () => {
      try {
        const wineId = await getWineIdFromToken(token);
        if (wineId) {
          const response = await fetch(`/get-wine-data?id=${wineId}`);
          if (response.ok) {
            const wineData = await response.json();
            setWine(wineData.wine);
          } else {
            setError('Wine not found');
          }
        } else {
          setError('Invalid token');
        }
      } catch (err) {
        setError('Error fetching wine data');
      } finally {
        setLoading(false);
      }
    };

    fetchWine();
  }, [token]);

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
          {wine['Image URL (Desktop)'] && (
            <div className="wine-details-image-container">
              <img
                src={wine['Image URL (Desktop)']} // Default to desktop image
                srcSet={`
                          ${wine['Image URL (Mobile)']} 600w, 
                          ${wine['Image URL (Desktop)']} 1200w
                        `}
                sizes="(max-width: 600px) 100vw, 1200px" // Change to 100vw for full-width on mobile
                alt={wine.name}
                className="wine-detail-image"
              />
              <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} round={false}  /> 
            </div>
          )}

            <div className="wine-detail-info">

              <p><strong>Grape:</strong> {wine.grape}</p>
              <p><strong>Vintage:</strong> {wine.vintage}</p>
              <p><strong>Region:</strong> {wine.region}</p>
              <p><strong>Producer:</strong> {wine.producer}</p>
              <p><strong>Alcohol Content:</strong> {wine.alcoholContent}</p>
              <p><strong>Quality Classification:</strong> {wine.qualityClassification}</p>
              <p><strong>Colour:</strong> {wine.colour}</p>
              <p><strong>Nose:</strong> {wine.nose}</p>
              <p><strong>Palate:</strong> {wine.palate}</p>
              <p><strong>Pairing:</strong> {wine.pairing}</p>
              <p><strong>Peak Maturity:</strong> {wine.peakMaturity}</p>
              <div className="wine-detail-info">

                {/* Map of Wine Region */}
                <WineMap region={wine.region} />

              </div>
            </div>  

        </div>
      ) : (
        <p>Wine data not found</p>
      )}
    </div>
  );
};

export default SharedWineDetail;
