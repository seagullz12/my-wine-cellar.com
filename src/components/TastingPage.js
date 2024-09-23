import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const TastingPage = ({ backendURL }) => {
  const { wineId } = useParams(); // Get the wine ID from the URL
  const [wineData, setWineData] = useState(null);
  const [tastingNotes, setTastingNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWineDetails = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();

      try {
        const response = await fetch(`${backendURL}/get-wine-data/${wineId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch wine details');
        }

        const data = await response.json();
        setWineData(data.data);
      } catch (error) {
        console.error('Error fetching wine details:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      const updatedData = {
        ...wineData,
        tastingNotes, // Add tasting notes to wine data
      };

      try {
        const response = await fetch(`${backendURL}/update-wine-data`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: wineId,
            wineData: updatedData,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save tasting notes');
        }

        alert('Tasting notes saved successfully!');
      } catch (error) {
        console.error('Error saving tasting notes:', error);
      }
    }
  };

  React.useEffect(() => {
    fetchWineDetails();
  }, []);

  if (loading) {
    return <p>Loading wine details...</p>;
  }

  if (!wineData) {
    return <p>Wine not found.</p>;
  }

  return (
    <div className="tasting-page">
      <h1>{wineData.name}</h1>
      <p><strong>Grape:</strong> {wineData.grape}</p>
      <p><strong>Vintage:</strong> {wineData.vintage}</p>
      <p><strong>Region:</strong> {wineData.region}</p>
      <p><strong>Producer:</strong> {wineData.producer}</p>
      <p><strong>Alcohol:</strong> {wineData.alcohol}</p>
      <p><strong>Classification:</strong> {wineData.classification}</p>
      <p><strong>Notes:</strong> {wineData.notes}</p>

      <h2>Add Tasting Notes</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={tastingNotes}
          onChange={(e) => setTastingNotes(e.target.value)}
          placeholder="Write your tasting notes here..."
          rows="5"
          required
        />
        <button type="submit">Save Tasting Notes</button>
      </form>
    </div>
  );
};

export default TastingPage;
