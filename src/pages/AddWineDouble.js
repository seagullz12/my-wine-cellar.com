import React, { useRef, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import WineDetailEditForm from '../components/WineDetailEditForm';
import '../styles/AddWine.css';

const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app'; 
//const backendURL = 'http://192.168.2.9:8080';

const AddWine = () => {
  const [ocrResult, setOcrResult] = useState('');  // Combined OCR result from front and back images
  const [wineData, setWineData] = useState({
    name: 'unknown',
    grape: 'unknown',
    vintage: 'unknown',
    region: 'unknown',
    producer: 'unknown',
    alcohol: 'unknown',
    classification: 'unknown',
    colour: 'unknown',
    nose: 'unknown',
    palate: 'unknown',
    pairing: 'unknown',
  });

  const [loading, setLoading] = useState(false);
  const [frontImageURL, setFrontImageURL] = useState('');  // For front image preview
  const [backImageURL, setBackImageURL] = useState('');   // For back image preview
  const [isMobile, setIsMobile] = useState(false);
  const [logMessages, setLogMessages] = useState([]);
  const [notification, setNotification] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [user, setUser] = useState(null);
  const [wineURL, setWineURL] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Function to resize image using canvas
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

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

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/webp', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Helper function to add log messages to the UI
  const addLogMessage = (message) => {
    setLogMessages((prevMessages) => [...prevMessages, message]);
  };

  // Function to handle file changes (for front and back images)
  const handleFileChange = async (event, imageType) => {
    const file = event.target.files[0];
    if (!file) {
      addLogMessage('No file selected');
      alert('No file selected.');
      return;
    }

    addLogMessage(`File selected: ${file.name}`);
    const resizedImageBlob = await resizeImage(file);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result;

      if (imageType === 'front') {
        setFrontImageURL(dataUrl);
      } else {
        setBackImageURL(dataUrl);
      }

      addLogMessage(`Image resized and loaded: ${imageType} image`);

      // Trigger OCR processing after image is loaded
      await performOCR(resizedImageBlob, imageType);
    };

    reader.readAsDataURL(resizedImageBlob);
  };

  // Function to clean the extracted text from the images
  const cleanText = (text) => {
    return text
      .replace(/[^a-zA-Z0-9\sÀ-ÿ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Function to extract wine data from text
  const extractWineData = async (text) => {
    setLoading(true);

    try {
      const response = await fetch(backendURL + '/extract-wine-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({ text }),  // Send cleaned text to the backend
      });

      if (response.ok) {
        const result = await response.json();
        const parsedData = parseWineData(result.data);
        setWineData(parsedData);
      } else {
        setOcrResult(`Error extracting wine data. Status: ${response.status}`);
      }
    } catch (error) {
      setOcrResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  // Function to parse extracted wine data
  const parseWineData = (data) => {
    const result = {
      name: 'unknown',
      grape: 'unknown',
      vintage: 'unknown',
      region: 'unknown',
      producer: 'unknown',
      alcohol: 'unknown',
      classification: 'unknown',
      colour: 'unknown',
      nose: 'unknown',
      palate: 'unknown',
      pairing: 'unknown',
    };

    const regex = /([^:;]+):\s*([^;]+)/g;
    let match;
    while ((match = regex.exec(data)) !== null) {
      const field = match[1].toLowerCase().trim();
      const value = match[2].trim();
      if (result.hasOwnProperty(field)) result[field] = value;
    }
    return result;
  };

  // Function to perform OCR on the image and update the OCR result
  const performOCR = async (imageBlob, imageType) => {
    const formData = new FormData();
    formData.append('image', imageBlob); // Append the image blob

    try {
      const response = await fetch(backendURL + '/process-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`, // Send the user's token for authentication
        },
        body: formData, // Send the image as FormData
      });

      if (response.ok) {
        const result = await response.json();
        const text = cleanText(result.text);  // Clean the extracted text

        addLogMessage(`OCR result for ${imageType}: ${text}`);

        // Update the OCR result state by concatenating the OCR results from both sides
        setOcrResult((prevResult) => `${prevResult} ${text}`);

        // Once both images are processed, extract wine data
        if (imageType === 'back' && ocrResult) {
          extractWineData(`${ocrResult} ${text}`);  // Combine front and back OCR results for wine data extraction
        }
      } else {
        setOcrResult(`Error performing OCR. Status: ${response.status}`);
      }
    } catch (error) {
      setOcrResult(`Error: ${error.message}`);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setWineData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    appendWineDataToFirestore();
    setIsEditing(false);
  };

  const toggleEditForm = () => {
    setIsEditing(!isEditing);
  };

  const appendWineDataToFirestore = async () => {
    if (!wineData.name || wineData.name.trim() === 'unknown') {
      setOcrResult('No name provided. Skipping Firestore update.');
      return;
    }

    const id = uuidv4();

    try {
      const response = await fetch(backendURL + '/append-wine-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({ wineData, frontImageUrl: frontImageURL, backImageUrl: backImageURL, id }),
      });

      const result = await response.json();

      if (response.ok) {
        // Construct the wine URL based on the response
        const wineUrl = `${backendURL}/cellar/${id}`;
        setWineURL(wineUrl);

        setOcrResult(`Wine data appended to Firestore successfully. Response: ${JSON.stringify(result.response)}`);

        // Set notification message
        setNotification(`"${wineData.name}" has been added to your cellar. View it <a href="${wineUrl}" target="_blank">here</a>.`);
        setShowNotification(true);  // Show notification

        // Hide notification after 5 seconds (increased time for visibility)
        setTimeout(() => {
          setShowNotification(false);
          setNotification('');  // Clear notification message
        }, 5000);  // Increased from 3000 to 5000 milliseconds
      } else {
        setOcrResult(`Error appending wine data. Status: ${response.status}. Message: ${result.message}`);
      }
    } catch (error) {
      setOcrResult(`Error: ${error.message}`);
    }
  };

  return (
    <div className="add-wine-container">
      {showNotification && (
        <div className="notification" dangerouslySetInnerHTML={{ __html: notification }} />
      )}
      <div className="file-upload-container">
        <button
          className="upload-button"
          onClick={() => document.getElementById('front-label-upload').click()}
        >
          Scan Front Label
        </button>
        <input
          type="file"
          accept="image/*"
          id="front-label-upload"
          style={{ display: 'none' }}
          onChange={(e) => handleFileChange(e, 'front')}
        />

        <button
          className="upload-button"
          onClick={() => document.getElementById('back-label-upload').click()}
        >
          Scan Back Label
        </button>
        <input
          type="file"
          accept="image/*"
          id="back-label-upload"
          style={{ display: 'none' }}
          onChange={(e) => handleFileChange(e, 'back')}
        />
      </div>

      <div className="wine-details">
        {!isEditing ? (
          // Conditionally render the Add to Cellar button
          wineData.name !== 'unknown' && !loading && (
            <button
              onClick={handleFormSubmit}
              className="add-button"
            >
              Add to Cellar
            </button>
          )
        ) : (
          ''
        )}
        <div className="img-container">
          {frontImageURL && <img src={frontImageURL} alt="Front Label" />}
          {backImageURL && <img src={backImageURL} alt="Back Label" />}
        </div>

        {!isEditing ? (
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
                  <li><strong>Alcohol Content:</strong> {wineData.alcohol}</li>
                  <li><strong>Quality Classification:</strong> {wineData.classification}</li>
                  <li><strong>Colour:</strong> {wineData.colour}</li>
                  <li><strong>Nose:</strong> {wineData.nose}</li>
                  <li><strong>Palate:</strong> {wineData.palate}</li>
                  <li><strong>Pairing:</strong> {wineData.pairing}</li>
                  <button onClick={toggleEditForm}>Edit Details</button>
                </ul>
              ) : (
                <p align='center'>Please scan a bottle label first.</p>
              )
            )}
          </div>
        ) : (
          <WineDetailEditForm
            formData={wineData}
            handleChange={handleFormChange}
            handleSubmit={handleFormSubmit}
            handleEditToggle={toggleEditForm}
          />
        )}
      </div>
    </div>
  );
};

export default AddWine;
