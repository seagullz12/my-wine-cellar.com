import React, { useRef, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import WineDetailEditForm from '../components/WineDetailEditForm';
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';

const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app'; 
// const backendURL = 'http://192.168.2.9:8080';

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

        setOcrResult(result.message || 'Wine data added successfully!');
        setShowNotification(true);
        setFrontImageURL('');  // Clear the front image URL
        setBackImageURL('');   // Clear the back image URL
      } else {
        setOcrResult(`Error: ${result.message}`);
      }
    } catch (error) {
      setOcrResult(`Error: ${error.message}`);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Add a New Wine</Typography>
      <Typography variant="h6" gutterBottom>Upload Front and Back Images</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={frontImageURL || 'placeholder_front_image.png'}
              alt="Front Image Preview"
            />
            <CardContent>
              <input
                accept="image/*"
                id="front-image-upload"
                type="file"
                onChange={(event) => handleFileChange(event, 'front')}
                style={{ display: 'none' }}
              />
              <label htmlFor="front-image-upload">
                <Button variant="contained" component="span" fullWidth>
                  Upload Front Image
                </Button>
              </label>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={backImageURL || 'placeholder_back_image.png'}
              alt="Back Image Preview"
            />
            <CardContent>
              <input
                accept="image/*"
                id="back-image-upload"
                type="file"
                onChange={(event) => handleFileChange(event, 'back')}
                style={{ display: 'none' }}
              />
              <label htmlFor="back-image-upload">
                <Button variant="contained" component="span" fullWidth>
                  Upload Back Image
                </Button>
              </label>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {ocrResult && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">OCR Result:</Typography>
          <Typography>{ocrResult}</Typography>
        </Box>
      )}

      {isEditing ? (
        <WineDetailEditForm
          wineData={wineData}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
          toggleEditForm={toggleEditForm}
        />
      ) : (
        <Button variant="outlined" onClick={toggleEditForm} sx={{ mt: 2 }}>
          Edit Wine Details
        </Button>
      )}

      <Snackbar open={showNotification} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity="success">
          {ocrResult} <br />
          {wineURL && <a href={wineURL} target="_blank" rel="noopener noreferrer">View Wine</a>}
        </Alert>
      </Snackbar>

      {logMessages.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Log Messages:</Typography>
          {logMessages.map((msg, index) => (
            <Typography key={index}>{msg}</Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AddWine;
