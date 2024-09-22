import React from 'react';
import { useParams, Link } from 'react-router-dom';
import WineMap from './WineMap'; 
import PeakMaturityBadge from './PeakMaturityBadge';
import { Helmet } from 'react-helmet'; // Import Helmet
import '../styles/WineDetail.css';

const SharedWineDetail = ({ wine }) => {
  const { token } = useParams();

  if (!wine) return <div>Loading...</div>;

  return (
    <div className="wine-detail-container">
      <div className="back-link" align="left">
        <Link to="/cellar" className="back-to-wine-list">Back to Your Cellar</Link>
      </div>
      {wine ? (
        <div className="wine-detail-card">
          <Helmet>
            <title>{wine.name} - My Wine Cellar</title>
            <meta property="og:title" content={wine.name} />
            <meta property="og:description" content={`Details about ${wine.name}`} />
            <meta property="og:image" content={wine['Image URL (Desktop)'] || ''} />
            <meta property="og:url" content={`https://yourdomain.com/shared-wine/${token}`} />
          </Helmet>
          <div className="wine-detail-header">
            <h1>{wine.name}</h1>
          </div>
          {wine['Image URL (Desktop)'] && (
            <div className="wine-details-image-container">
              <img
                src={wine['Image URL (Desktop)']}
                srcSet={`
                          ${wine['Image URL (Mobile)']} 600w, 
                          ${wine['Image URL (Desktop)']} 1200w
                        `}
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
            <p><strong>Alcohol Content:</strong> {wine.alcoholContent}</p>
            <p><strong>Quality Classification:</strong> {wine.qualityClassification}</p>
            <p><strong>Colour:</strong> {wine.colour}</p>
            <p><strong>Nose:</strong> {wine.nose}</p>
            <p><strong>Palate:</strong> {wine.palate}</p>
            <p><strong>Pairing:</strong> {wine.pairing}</p>
            <p><strong>Peak Maturity:</strong> {wine.peakMaturity}</p>
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
