import React, { useRef, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import WineDetailEditForm from '../components/WineDetailEditForm';
import '../styles/AddWineDoubleOptional.css';
import {
  Box,
  Typography,
  Card,
  Button
} from '@mui/material';


const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';
//const backendURL = 'http://192.168.2.9:8080';

const formatDateToUS = (date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Function to parse extracted wine data
const today = new Date();
const formattedToday = formatDateToUS(today); // Format the date in MM/DD/YYYY format

const AddWine = () => {
  const [ocrResult, setOcrResult] = useState('');  // Combined OCR result from front and back images
  const [wineData, setWineData] = useState({
    name: 'unknown',
    grape: ['unknown'],
    vintage: 'unknown',
    region: 'unknown',
    country: 'unknown',
    producer: 'unknown',
    alcohol: 'unknown',
    classification: ['unknown'],  // Changed to an array
    colour: 'unknown',
    nose: ['unknown'],  // Changed to an array
    palate: ['unknown'],  // Changed to an array
    pairing: ['unknown'],  // Changed to an array
    terroir: ['unknown'],  // Added terroir field as an array
    description: 'unknown',
    dateAdded: formattedToday
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
        const extractedData = result.data; // Accessing the wine data from the JSON response

        setWineData({
          name: extractedData.name || 'unknown',
          grape: extractedData.grape.join(', ') || 'unknown',
          terroir: extractedData.terroir.join(', ') || 'unknown',
          vintage: extractedData.vintage || 'unknown',
          region: extractedData.region || 'unknown',
          country: extractedData.country || 'unknown',
          producer: extractedData.producer || 'unknown',
          alcohol: extractedData.alcohol || 'unknown',
          classification: extractedData.classification.join(', ') || 'unknown',
          colour: extractedData.colour || 'unknown',
          nose: extractedData.nose.join(', ') || 'unknown',
          palate: extractedData.palate.join(', ') || 'unknown',
          pairing: extractedData.pairing.join(', ') || 'unknown',
          description: extractedData.description || 'unknown',
          dateAdded: formattedToday,
          drinkingWindow: {
            lower: extractedData.optimal_drinking_window?.lower || 'unknown',
            upper: extractedData.optimal_drinking_window?.upper || 'unknown',
          },
        });
      } else {
        setOcrResult(`Error extracting wine data. Status: ${response.status}`);
      }
    } catch (error) {
      setOcrResult(`Error: ${error.message}`);
    }
    setLoading(false);
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
        console.log(text)

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
        body: JSON.stringify({
          wineData,
          frontImageUrl: frontImageURL || null, // Send null if no image uploaded
          backImageUrl: backImageURL || null,   // Send null if no image uploaded
          id
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Construct the wine URL based on the response
        const wineUrl = `${backendURL}/cellar/${id}`;
        setWineURL(wineUrl);
        setOcrResult(`Wine data appended to Firestore successfully. Response: ${JSON.stringify(result.response)}`);

        // Set notification message
        setNotification(`"${wineData.name}" has been added to your cellar. View it <a href="https://my-wine-cellar.com/cellar/${id}" target="_blank">here</a>.`);
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

  // Function to handle skipping the front label
  const handleSkipFrontLabel = () => {
    addLogMessage('Skipped front label upload.');
    // Trigger extraction for back label or other processing if needed
    if (backImageURL) {
      extractWineData(`${ocrResult}`); // Combine current OCR results for extraction
    } else {
      addLogMessage('No back label uploaded, unable to extract data.');
    }
  };

  // Function to handle skipping the back label
  const handleSkipBackLabel = () => {
    addLogMessage('Skipped back label upload.');
    // Trigger extraction for front label or other processing if needed
    if (frontImageURL) {
      extractWineData(`${ocrResult}`); // Combine current OCR results for extraction
    } else {
      addLogMessage('No front label uploaded, unable to extract data.');
    }
  };

  const spacingValue = 1.5;
  return (
    <div className="add-wine-container">
      <div className="file-upload-container">
        <Box display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            onClick={() => document.getElementById('front-label-upload').click()}
            sx={{ margin: 2 }}
          >
            Scan Front Label
          </Button>
          <input
            type="file"
            accept="image/*"
            id="front-label-upload"
            style={{ display: 'none' }}
            onChange={(e) => handleFileChange(e, 'front')}
          />

          <Button
            variant="contained"
            onClick={() => document.getElementById('back-label-upload').click()}
            sx={{ margin: 2 }}
          >
            Scan Back Label
          </Button>
          <input
            type="file"
            accept="image/*"
            id="back-label-upload"
            style={{ display: 'none' }}
            onChange={(e) => handleFileChange(e, 'back')}
          />
        </Box>
        <div className="wine-details">
          {showNotification && (
            <div className="notification" dangerouslySetInnerHTML={{ __html: notification }} />
          )}
          <Box className="img-container" position="relative">
            {frontImageURL && (
              <div>
                <img src={frontImageURL} alt="Front Label" style={{ width: '100%', height: 'auto' }} />
                {!frontImageURL || !backImageURL ? ( // Hide skip button when both images are uploaded.
                  <Button
                    variant="contained"
                    onClick={() => handleSkipBackLabel()}
                    sx={{
                      position: 'absolute',
                      bottom: 15,  // Adjust this value to position the button vertically
                      right: 15,   // Adjust this value to position the button horizontally
                    }}
                  >
                    Proceed with only the Front Label
                  </Button>
                ) : null}
              </div>
            )}
            {backImageURL && (
              <div>
                <img src={backImageURL} alt="Back Label" style={{ width: '100%', height: 'auto' }} />
                {!frontImageURL || !backImageURL ? ( // Hide skip button when both images are uploaded.
                  <Button
                    variant="contained"
                    onClick={handleSkipFrontLabel}
                    sx={{
                      position: 'absolute',
                      bottom: 15,  // Adjust this value to position the button vertically
                      right: 15,   // Adjust this value to position the button horizontally
                    }}
                  >
                    Proceed with only Back Label
                  </Button>
                ) : null}
              </div>
            )}
          </Box>
        </div>

        <Card sx={{ backgroundColor: '#F5F5F5' }}>
          {!isEditing && (
            <h3>About this bottle:</h3>
          )}
          {loading ? (
            <p>Loading...</p>
          ) : (
            wineData.name !== 'unknown' && !isEditing ? (
              <ul>
                <Box sx={{ padding: 2, margin: 1 }}>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Grape:</strong> {wineData.grape}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Vintage:</strong> {wineData.vintage}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Terroir:</strong> {wineData.terroir}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Region:</strong> {wineData.region}, {wineData.country}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Producer:</strong> {wineData.producer}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Alcohol Content:</strong> {wineData.alcohol}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Quality Classification:</strong> {wineData.classification}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Colour:</strong> {wineData.colour}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Nose:</strong> {wineData.nose}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Palate:</strong> {wineData.palate}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Pairing:</strong> {wineData.pairing}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Drinking Window:</strong> {wineData.drinkingWindow.lower} - {wineData.drinkingWindow.upper}
                  </Typography>
                  <Typography sx={{ textAlign: "left", mb: spacingValue }}>
                    <strong>Description:</strong> {wineData.description}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Button variant="outlined" onClick={toggleEditForm} sx={{ margin: 2 }}>
                    Edit Details
                  </Button>

                  {!isEditing && wineData.name !== 'unknown' && !loading && (
                    <Button
                      variant="contained"
                      onClick={handleFormSubmit}
                      sx={{ margin: 2 }}
                    >
                      Add to Cellar
                    </Button>
                  )}</Box>
              </ul>
            ) : (
              !isEditing && <p align='center'>Please scan a bottle label first.</p>
            )
          )}
        </Card>
      </div>

      {isEditing && (
        <WineDetailEditForm
          formData={wineData}
          handleChange={handleFormChange}
          handleSubmit={handleFormSubmit}
          handleEditToggle={toggleEditForm}
        />
      )}
    </div>
  );
};

export default AddWine;