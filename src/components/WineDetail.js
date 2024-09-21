import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, Link } from 'react-router-dom';
import WineDetailEditForm from './WineDetailEditForm';
import WineMap from './WineMap'; 
import PeakMaturityBadge from './PeakMaturityBadge';
import ShareWineButton from './ShareWineButton';
import '../styles/WineDetail.css';
import { getTokenFromUrl, getWineIdFromToken } from './utils'; 

const WineDetail = () => {
  const { id: wineId } = useParams(); // Directly use the wineId from params
  const [user, setUser] = useState(null);
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchWineData = async () => {
      const token = getTokenFromUrl();
      const resolvedWineId = token ? await getWineIdFromToken(token) : wineId;

      if (user && resolvedWineId) {
        try {
          const authToken = await user.getIdToken();
          const response = await fetch(`${backendURL}/get-wine-data?id=${resolvedWineId}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            setWine(result.wine);
            setFormData(result.wine);
          } else {
            setError('Error fetching wine data');
          }
        } catch (error) {
          setError('An error occurred while fetching wine data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWineData();
  }, [wineId, user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${backendURL}/update-wine-data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: wineId, wineData: formData }),
      });

      if (response.ok) {
        const updatedWine = await response.json();
        setWine(updatedWine.data);
        setIsEditing(false);
        setSuccessMessage('Wine details saved successfully!');
      } else {
        setError('Error updating wine data');
      }
    } catch (error) {
      setError('An error occurred while updating wine data');
    }
  };

  if (loading) return <p className="wine-detail-loading">Loading...</p>;
  if (error) return <p className="wine-detail-error">{error}</p>;

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
          {successMessage && (
            <div className="success-notification">
              <span className="success-icon">✔️</span> {successMessage}
            </div>
          )}

          {isEditing ? (
            <WineDetailEditForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleEditToggle={handleEditToggle}
            />
          ) : (
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
              {/* <ShareWineButton wineName={wine.name} wineId={wineId} /> */}
              <button onClick={handleEditToggle}>Edit</button>
              <WineMap region={wine.region} />
            </div>  
          )}
        </div>
      ) : (
        <p>Wine data not found</p>
      )}
    </div>
  );
};

export default WineDetail;
