import React, { useState } from 'react';
import '../styles/TastingNotesForm.css';

const TastingNotesForm = ({ wineId, backendURL, user, handleIsTasting }) => {
  const [tastingNotes, setTastingNotes] = useState('');
  const [rating, setRating] = useState(''); // Initialize as an empty string for controlled input
  const [finalNotes, setFinalNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for error message

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
        body: JSON.stringify({
          id: wineId,
          wineData: {
            status: 'consumed', // Update status if applicable
            tasting: {
              openedAt: new Date().toISOString(),
              tastingNotes,
              finalNotes,
              rating
            }
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save tasting notes');
      }

      // Clear form after submission
      setTastingNotes('');
      setRating('');
      setFinalNotes('');
      setSuccessMessage('Tasting notes saved successfully!');
      setErrorMessage(''); // Clear error message if the submission was successful
    } catch (error) {
      console.error('Error saving tasting notes:', error);
      setErrorMessage('Error saving tasting notes: ' + error.message); // Display error message
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="tasting-notes-form">
        <h2>Tasting Notes</h2>
        <textarea
          value={tastingNotes}
          onChange={(e) => setTastingNotes(e.target.value)}
          placeholder="Enter your tasting notes here..."
          required
        />
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="Rate this wine (1-5)"
          required
        />
        <textarea
          value={finalNotes}
          onChange={(e) => setFinalNotes(e.target.value)}
          placeholder="Final thoughts after drinking..."
        />
        <button type="submit" onClick={handleIsTasting}>Save Tasting Notes</button>
      </form>
      
      {/* Display success message */}
      {successMessage && <p className="success-message">{successMessage}</p>}
      
      {/* Display error message */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default TastingNotesForm;
