import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase-config'; // Ensure you import your Firestore instance
  
 export const getWineIdFromToken = async (token) => {
    try {
      // Fetch the document from Firestore using the token as the document ID
      const docRef = doc(db, 'sharedWineTokens', token);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        // Extract the wineId from the document data
        const { wineId } = docSnap.data();
        return wineId; // Return the wineId
      } else {
        console.error('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error fetching wine ID from token:', error);
      return null; // Handle the error appropriately
    }
  };