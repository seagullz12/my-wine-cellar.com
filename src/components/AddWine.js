import React, { useRef, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase Authentication functions
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import '../styles/AddWine.css';

const AddWine = () => {
    const videoRef = useRef(null);
    const [ocrResult, setOcrResult] = useState('');
    const [wineData, setWineData] = useState({
      name: 'unknown',
      grape: 'unknown',
      vintage: 'unknown',
      region: 'unknown',
      producer: 'unknown',
      alcoholContent: 'unknown',
      colour: 'unknown',
      nose: 'unknown',
      palate: 'unknown',
      pairing: 'unknown',
    });

    const [loading, setLoading] = useState(false);
    const [photoURL, setPhotoURL] = useState(''); // State to hold photo URL
    const [isMobile, setIsMobile] = useState(false);
    const [logMessages, setLogMessages] = useState([]); // State to hold log messages
    const [notification, setNotification] = useState(''); // State for notification
    const [showNotification, setShowNotification] = useState(false); // State for controlling visibility of notification
    const [user, setUser] = useState(null); // State to hold Firebase user
    const [wineURL, setWineURL] = useState(''); // State to hold the generated wine URL

    const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';
    //const backendURL = 'http://192.168.2.9:8080';

    // Function to resize image using canvas
const resizeImage = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxWidth = 800; // Maximum width for resizing
      const maxHeight = 600; // Maximum height for resizing
      let width = img.width;
      let height = img.height;

      // Resize the image while maintaining the aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions and draw the image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to a data URL (webp format, 80% quality)
      canvas.toBlob((blob) => {
        resolve(blob); // Pass the resized image blob
      }, 'image/webp', 0.8);
    };

    img.src = URL.createObjectURL(file);
  });
};

    // Detect if the user is on a mobile device
    useEffect(() => {
      setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
    }, []);

    // Check for authenticated user
    useEffect(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });

      return () => unsubscribe();
    }, []);

    // Helper function to add log messages to the UI
    const addLogMessage = (message) => {
      setLogMessages((prevMessages) => [...prevMessages, message]);
    };

    // Function to handle taking a photo and processing it
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  
  if (!file) {
    addLogMessage('No file selected');
    alert('No file selected.');
    return;
  }

  addLogMessage(`File selected: ${file.name}`);
  
  // Resize the image before further processing
  const resizedImageBlob = await resizeImage(file);

  // Convert the resized blob to a data URL
  const reader = new FileReader();
  reader.onloadend = async () => {
    const dataUrl = reader.result;
    setPhotoURL(dataUrl);

    addLogMessage('Image resized and loaded, making API call to process image');
    
    if (user) { // Proceed only if user is authenticated
      try {
        const response = await fetch(backendURL + '/process-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}` // Include the token in the request headers
          },
          body: JSON.stringify({ imageUrl: dataUrl }),
        });

        if (response.ok) {
          const result = await response.json();
          addLogMessage('OCR Result: ' + result.text);

          const cleanedText = cleanText(result.text);
          setOcrResult(cleanedText);

          // Extract wine data and update state
          await extractWineData(cleanedText);
        } else {
          addLogMessage('Error processing image response');
          alert('Error processing image.');
        }
      } catch (error) {
        addLogMessage('Error processing image: ' + error.message);
        alert('An error occurred while processing the image.');
      }
    } else {
      alert('You must be logged in to scan a bottle.');
    }
  };

  reader.readAsDataURL(resizedImageBlob);
};


    const cleanText = (text) => {
      return text
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove non-alphanumeric characters (excluding space)
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .trim(); // Remove leading and trailing whitespace
    };

    // Function to send wine data to backend and receive a unique URL
    const appendWineDataToFirestore = async () => {
      if (!wineData.name || wineData.name.trim() === 'unknown') {
        setOcrResult('No name provided. Skipping Firestore update.');
        return;
      }

      const id = uuidv4(); // Generate a unique ID for the wine

      try {
        const response = await fetch(backendURL + '/append-wine-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}` // Include the token in the request headers
          },
          body: JSON.stringify({ wineData, imageUrl: photoURL, id }), // Include ID in the request
        });

        const result = await response.json();
        
        if (response.ok) {
          // Construct the wine URL based on the response
          const wineUrl = `${backendURL}/cellar/${id}`;
          setWineURL(wineUrl);

          setOcrResult(`Wine data appended to Firestore successfully. Response: ${JSON.stringify(result.response)}`);

          // Show success notification with the URL
          setNotification(`"${wineData.name}" has been added to your cellar. View it <a href="${wineUrl}" target="_blank">here</a>.`);
          setShowNotification(true);

          // Hide notification after 3 seconds
          setTimeout(() => {
            setShowNotification(false);
          }, 3000);
        } else {
          setOcrResult(`Error appending wine data. Status: ${response.status}. Message: ${result.message}`);
        }
      } catch (error) {
        setOcrResult(`Error: ${error.message}`);
      }
    };  
    
    const extractWineData = async (text) => {
      setLoading(true);
    
      try {
        console.log('Extracting data from text:', text);
        const response = await fetch(backendURL + '/extract-wine-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}` // Include the token in the request headers
          },
          body: JSON.stringify({ text }),
        });
    
        if (response.ok) {
          const result = await response.json();
          console.log('Extracted Wine Data:', result.data);
    
          const parsedData = parseWineData(result.data);
          console.log('Parsed Wine Data:', parsedData);
    
          // Update state with parsed data
          setWineData(parsedData);
        } else {
          setOcrResult(`Error extracting wine data. Status: ${response.status}`);
        }
      } catch (error) {
        setOcrResult(`Error: ${error.message}`);
      }
      setLoading(false);
    };
  
    const parseWineData = (data) => {
      const result = {
        name: 'unknown',
        grape: 'unknown',
        vintage: 'unknown',
        region: 'unknown',
        producer: 'unknown',
        alcoholContent: 'unknown',
        colour: 'unknown',
        nose: 'unknown',
        palate: 'unknown',
        pairing: 'unknown',
      };
  
      const regex = /(\w+):\s*([^;]+)/g;
      let match;
  
      while ((match = regex.exec(data)) !== null) {
        const field = match[1].toLowerCase();
        const value = match[2].trim();
  
        switch (field) {
          case 'name':
            result.name = value;
            break;
          case 'grape':
            result.grape = value;
            break;
          case 'vintage':
            result.vintage = value;
            break;
          case 'region':
            result.region = value;
            break;
          case 'producer':
            result.producer = value;
            break;
          case 'alcohol content':
            result.alcoholContent = value;
            break;
          case 'colour':
            result.colour = value;
            break;
          case 'nose':
            result.nose = value;
            break;
          case 'palate':
            result.palate = value;
            break;
          case 'pairing':
            result.pairing = value;
            break;
          default:
            addLogMessage(`Unrecognized field: ${field}`);
        }
      }
  
      return result;
    };
  
    return (
      <div className="AddWine">
        <div className="container">
          {isMobile ? (
            <>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                id="takePhotoInput"
              />
              <label htmlFor="takePhotoInput" className="custom-button">Scan Wine Label</label>
              
              {/* Conditionally render the Add to Cellar button based on wine data */}
              {wineData.name !== 'unknown' && !loading && (
                <button 
                  onClick={appendWineDataToFirestore} 
                  className="custom-button"
                >
                  Add to Cellar
                </button>
              )}
    
              {/* Show the notification */}
              {showNotification && (
                <div className="notification" dangerouslySetInnerHTML={{ __html: notification }} />
              )}
    
              <div className="img-container">
                {photoURL && <img src={photoURL} alt="Captured" />}
              </div>
            </>
          ) : (
            <>
              <p>Camera scanning not available on desktop.</p>
            </>
          )}
    
          <div className="data-container">
            <h3>About this bottle:</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              wineData.name !== 'unknown' ? (
                <ul>
                  <li><strong>Name:</strong> {wineData.name}</li>
                  <li><strong>Grape:</strong> {wineData.grape}</li>
                  <li><strong>Vintage:</strong> {wineData.vintage}</li>
                  <li><strong>Region:</strong> {wineData.region}</li>
                  <li><strong>Producer:</strong> {wineData.producer}</li>
                  <li><strong>Alcohol Content:</strong> {wineData.alcoholContent}</li>
                  <li><strong>Colour:</strong> {wineData.colour}</li>
                  <li><strong>Nose:</strong> {wineData.nose}</li>
                  <li><strong>Palate:</strong> {wineData.palate}</li>
                  <li><strong>Pairing:</strong> {wineData.pairing}</li>
                </ul>
              ) : (
                <p align='center'>Please scan a bottle label first.</p>
              )
            )}
          </div>
    
          {/* <div className="log-container">
            <h3>Log Messages:</h3>
            <ul>
              {logMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div> */}
        </div>
      </div>
    );
};

export default AddWine;
