import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, Link } from 'react-router-dom';
import WineDetailEditForm from './WineDetailEditForm';
import '../styles/WineDetail.css';
import AgeTracker from './AgeTracker';
import WineMap from './WineMap'; // Import the new component
import AgeBadge from './AgeBadge';

const WineDetail = () => {
  const { id } = useParams();
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
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await fetch(`${backendURL}/get-wine-data?id=${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            const fetchedWine = result.wine;
            setWine(fetchedWine);
            setFormData(fetchedWine); // Set initial form data
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
  }, [id, user]);

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
        body: JSON.stringify({ id, wineData: formData }),
      });

      if (response.ok) {
        const updatedWine = await response.json();
        setWine(updatedWine.data);
        setIsEditing(false);
        setSuccessMessage('Wine details saved successfully!'); // Set success message
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
            <img
              src={wine['Image URL (Desktop)']}
              alt={wine.name}
              className="wine-detail-image"
            />

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
              {wine && (
  <div className="wine-image-container">
    <img src={wine['Image URL (Desktop)']} alt={wine.name} className="wine-detail-image" />
    <AgeBadge vintage={wine.vintage} /> {/* Pass vintage directly */}
  </div>
)}

               {/* Age Tracker visual */}   
              <AgeTracker vintage={wine.vintage} />
             
              <button onClick={handleEditToggle}>Edit</button>
              <div className="wine-detail-info">
              {/* Existing wine details... */}

              {/* Map of Wine Region */}
              <WineMap region={wine.region} />
              
              </div>
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
