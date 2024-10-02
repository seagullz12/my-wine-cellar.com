import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import TastingNotesForm from '../components/TastingNotesForm'; 
//import '../styles/TastingPage.css';

const TastingPage = () => {
  const { id: wineId } = useParams(); // Directly use the wineId from params
  const [wine, setWine] = useState(null);
  const [error, setError] = useState(null);
  const [tastingNotes, setTastingNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [user, setUser] = useState(null);

  const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';

  const fetchWineDetails = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const authToken = await user.getIdToken();

      try {
        const authToken = await user.getIdToken();
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-wine-data?id=${wineId}`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      const updatedData = {
        ...wine,
        tastingNotes, // Add tasting notes to wine data
      };

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update-wine-data`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: wineId,
            wine: updatedData,
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

  if (!wine) {
    return <p>Wine not found.</p>;
  }

  return (
    <div className="tasting-page">
        <div className="tasting-header">
            <h1>{wine.name}</h1>
            <img
                    src={wine.images.front.desktop}
                    srcSet={`${wine.images.front.mobile} 600w, ${wine.images.front.desktop} 1200w`}
                    sizes="(max-width: 600px) 100vw, 1200px"
                    alt={`${wine.name} front image`}
                    className="wine-detail-image"
                  />
        </div>
        <div className="wine-details">
            <div className="wine-detail">
                <span>Grape:</span>
                <span>{wine.grape}</span>
            </div>
            <div className="wine-detail">
                <span>Vintage:</span>
                <span>{wine.vintage}</span>
            </div>
            <div className="wine-detail">
                <span>Status:</span>
                <span>{wine.status}</span>
            </div>
            {/* Add more wine details as needed */}
        </div>
        <div className="tasting-notes">
            <h2>Tasting Notes</h2>
            <p>{wine.tastingNotes}</p>
        </div>
        <button className="start-tasting-btn">Start Tasting</button>
        <TastingNotesForm
              wineId={wineId}
              backendURL={backendURL}
              user={user} // Ensure user is passed here
              />
        <TastingNotesForm />
    </div>
);
};

export default TastingPage;
