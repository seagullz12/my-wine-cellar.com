import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { db } from './firebase-config'; // Adjust the path as needed
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ShareWineButton = ({ wineName, wineId }) => {
  const [isLoading, setIsLoading] = useState(false); // For button loading state
  const [errorMessage, setErrorMessage] = useState(null); // Error message state

  const generateUniqueToken = async () => {
    if (!wineId) {
      console.error('wineId is undefined or invalid');
      setErrorMessage('Unable to share wine: Invalid wine ID.');
      return null;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setErrorMessage('User is not authenticated.');
        return null;
      }

      const token = uuid(); // Generate a unique token and set in firestore
      await setDoc(doc(db, 'sharedWineTokens', token), {
        wineId: wineId,
        createdAt: new Date(),
      });

      return token;

    } catch (error) {
      console.error('Error generating unique token:', error);
      setErrorMessage('An error occurred while sharing the wine.');
      return null;
    }
  };

  const handleShare = async () => {
    setIsLoading(true); // Show loading state
    setErrorMessage(null); // Reset any previous error message
    
    const token = await generateUniqueToken(); // Get the token
//    const encodedToken = btoa(token)

    if (token) {
      const message = `Heeeey, let's drink this wine together!: *${wineName}* ! https://my-wine-cellar.com/#/shared/${token}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      console.error('Failed to generate token or wineId was invalid.');
    }

    setIsLoading(false); // End loading state
  };

  return (
    <>
      <button onClick={handleShare} className="share-wine-button" disabled={isLoading}>
        {isLoading ? 'Sharing...' : 'Share on WhatsApp'}
      </button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </>
  );
};

export default ShareWineButton;
