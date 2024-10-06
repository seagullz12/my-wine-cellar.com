import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import WineDetailEditForm from '../components/WineDetailEditForm';
import AddWineNotification from '../components/AddWineNotification'
import { useTheme } from '@mui/material/styles';

import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  useMediaQuery,
  Stack,
} from '@mui/material';

import WineData from '../components/WineData';

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
  const [logMessages, setLogMessages] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [user, setUser] = useState(null);
  const [wineURL, setWineURL] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/extract-wine-data', {
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
          grape: extractedData.grape || 'unknown',
          terroir: extractedData.terroir || 'unknown',
          vintage: extractedData.vintage || 'unknown',
          region: extractedData.region || 'unknown',
          country: extractedData.country || 'unknown',
          producer: extractedData.producer || 'unknown',
          alcohol: extractedData.alcohol || 'unknown',
          classification: extractedData.classification || 'unknown',
          colour: extractedData.colour || 'unknown',
          nose: extractedData.nose || 'unknown',
          palate: extractedData.palate || 'unknown',
          pairing: extractedData.pairing || 'unknown',
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
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/process-image', {
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
   
    // Scroll to the top of the page where the notification is at.  
   window.scrollTo(0, 0);
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
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/append-wine-data', {
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
        const wineUrl = `/#/cellar/${id}`;
        setWineURL(wineUrl);
        setOcrResult(`Wine data appended to Firestore successfully. Response: ${JSON.stringify(result.response)}`);

        // Set notification message
        setNotificationMessage(`"${wineData.name}" has been added to your cellar.`);
        setShowSnackbar(true); // Show Snackbar

        // clear form for new entries
        setFrontImageURL('')
        setFrontImageURL('')
        setWineData({
          name: 'unknown',
          grape: ['unknown'],
          vintage: 'unknown',
          region: 'unknown',
          country: 'unknown',
          producer: 'unknown',
          alcohol: 'unknown',
          classification: ['unknown'],
          colour: 'unknown',
          nose: ['unknown'],
          palate: ['unknown'],
          pairing: ['unknown'],
          terroir: ['unknown'],
          description: 'unknown',
          dateAdded: formattedToday
        });

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

  return (
    <Box p={isMobile ? 2 : 4}>
      <Grid container spacing={3}>
        {/* File upload and image section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              Add new wines:
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => document.getElementById('front-label-upload').click()}
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
            </Stack>

            {/* Image previews */}
            <Box mt={2}>
              <Grid container spacing={2}>
                {frontImageURL && (
                  <Grid item xs={12} md={6}>
                    <Box position="relative">
                      <img
                        src={frontImageURL}
                        alt="Front Label"
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                      {!backImageURL && (
                        <Button
                          variant="contained"
                          onClick={handleSkipBackLabel}
                          sx={{
                            position: 'absolute',
                            bottom: 15,
                            right: 15,
                          }}
                        >
                          Proceed with Front Label Only
                        </Button>
                      )}
                    </Box>
                  </Grid>
                )}

                {backImageURL && (
                  <Grid item xs={12} md={6}>
                    <Box position="relative">
                      <img
                        src={backImageURL}
                        alt="Back Label"
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                      {!frontImageURL && (
                        <Button
                          variant="contained"
                          onClick={handleSkipFrontLabel}
                          sx={{
                            position: 'absolute',
                            bottom: 15,
                            right: 15,
                          }}
                        >
                          Proceed with Back Label Only
                        </Button>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Card>
        </Grid>

        {/* Wine details section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3, backgroundColor: '#fafafa' }}>
            <AddWineNotification
              open={showSnackbar}
              message={notificationMessage}
              onClose={() => setShowSnackbar(false)}
              wineUrl={wineURL}
            />

            {!isEditing && (
              <>
                <Typography variant="h6" gutterBottom>
                  About This Bottle
                </Typography>
                {loading ? (
                  <Typography>Loading...</Typography>
                ) : wineData.name !== 'unknown' ? (
                  <Box>
                    <WineData wine={wineData} wineDetailPage={true} />
                    <Stack direction="row" justifyContent="space-between" mt={2}>
                      <Button variant="outlined" onClick={toggleEditForm}>
                        Edit Details
                      </Button>
                      <Button variant="contained" onClick={handleFormSubmit}>
                        Add to Cellar
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Typography align="center" mt={2}>
                    Please scan a bottle label first.
                  </Typography>
                )}
              </>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Editing form section */}
      {isEditing && (
        <Box mt={4}>
          <WineDetailEditForm
            formData={wineData}
            handleChange={handleFormChange}
            handleSubmit={handleFormSubmit}
            handleEditToggle={toggleEditForm}
          />
        </Box>
      )}
    </Box>
  );
};

export default AddWine;