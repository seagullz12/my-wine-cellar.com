import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, Link } from 'react-router-dom';
import '../styles/WineDetail.css'; // Import the CSS file

const WineDetail = () => {
  const { id } = useParams(); // Get the ID from the URL
  const [user, setUser] = useState(null);
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedWineData, setEditedWineData] = useState({});

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
            if (result && result.wine) {
              setWine(result.wine);
              setEditedWineData(result.wine); // Initialize edited data
            } else {
              setError('Wine not found');
            }
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
    const { name, value } = e.target;
    setEditedWineData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Save edited wine data logic
    // Ensure image URLs are not included
    const { 'Image URL (Desktop)': _, 'Image URL (Mobile)': __, ...dataToSave } = editedWineData;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${backendURL}/append-wine-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wineData: dataToSave,
          id,
        }),
      });

      if (response.ok) {
        alert('Wine data updated successfully!');
        setIsEditing(false);
        setWine(prevWine => ({ ...prevWine, ...dataToSave }));
      } else {
        setError('Error updating wine data');
      }
    } catch (error) {
      setError('An error occurred while updating wine data');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedWineData(wine); // Reset edited data to original
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
          {isEditing ? (
            <form className="wine-edit-form" onSubmit={handleSave}>
              <div>
                <label>Grape:</label>
                <input type="text" name="grape" value={editedWineData.grape} onChange={handleChange} />
              </div>
              <div>
                <label>Vintage:</label>
                <input type="text" name="vintage" value={editedWineData.vintage} onChange={handleChange} />
              </div>
              <div>
                <label>Region:</label>
                <input type="text" name="region" value={editedWineData.region} onChange={handleChange} />
              </div>
              <div>
                <label>Producer:</label>
                <input type="text" name="producer" value={editedWineData.producer} onChange={handleChange} />
              </div>
              <div>
                <label>Alcohol Content:</label>
                <input type="text" name="alcoholContent" value={editedWineData.alcoholContent} onChange={handleChange} />
              </div>
              <div>
                <label>Quality Classification:</label>
                <input type="text" name="qualityClassification" value={editedWineData.qualityClassification} onChange={handleChange} />
              </div>
              <div>
                <label>Colour:</label>
                <input type="text" name="colour" value={editedWineData.colour} onChange={handleChange} />
              </div>
              <div>
                <label>Nose:</label>
                <input type="text" name="nose" value={editedWineData.nose} onChange={handleChange} />
              </div>
              <div>
                <label>Palate:</label>
                <input type="text" name="palate" value={editedWineData.palate} onChange={handleChange} />
              </div>
              <div>
                <label>Pairing:</label>
                <input type="text" name="pairing" value={editedWineData.pairing} onChange={handleChange} />
              </div>
              <button type="submit">Save</button>
              <button type="button" onClick={handleCancel}>Cancel</button>
            </form>
          ) : (
            <>
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
              </div>
              <button onClick={handleEditToggle}>{isEditing ? 'Cancel' : 'Edit'}</button>
            </>
          )}
        </div>
      ) : (
        <p>Wine data not found</p>
      )}
    </div>
  );
};

export default WineDetail;
