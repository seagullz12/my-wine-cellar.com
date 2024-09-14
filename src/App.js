import React, { useRef, useState } from 'react';
import { getWineDataFromText } from './openaiService.mjs'; // Import the function
import './App.css';

const App = () => {
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
  
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState(''); // State to hold photo URL

  const startScanning = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      if (isScanning) {
        stopScanning();
      }

      navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    setIsScanning(true);
    setPhotoURL(''); // Clear the photo URL
  })
  .catch(error => {
    console.error('Error accessing webcam:', error);

    // Display error message for users
    if (error.name === 'NotAllowedError') {
      alert('Camera access was denied. Please enable it in your browser settings.');
    } else if (error.name === 'NotFoundError') {
      alert('No camera device found.');
    } else {
      alert('An error occurred while trying to access the camera.');
    }
        });
    } else {
      console.error('getUserMedia not supported on this browser.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const processImage = async () => {
    if (!videoRef.current) {
      console.error('Video element not found');
      return;
    }
  
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
  
    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }
  
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
    const dataUrl = canvas.toDataURL('image/png');
    setPhotoURL(dataUrl); // Display the captured photo
    stopScanning(); // Stop the video stream after capturing
  
    try {
      const response = await fetch('http://localhost:3001/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: dataUrl }),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('OCR Result:', result.text);
        const cleanedText = cleanText(result.text);
        setOcrResult(cleanedText);
  
        // Extract wine data and update state
        await extractWineData(cleanedText);
      } else {
        console.error('Error processing image.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cleanText = (text) => {
    return text
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove non-alphanumeric characters (excluding space)
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim(); // Remove leading and trailing whitespace
  };

  const extractWineData = async (text) => {
    setLoading(true);
  
    try {
      console.log('Extracting data from text:', text);
      const result = await getWineDataFromText(text);
      console.log('Extracted Wine Data:', result);
  
      const parsedData = parseWineData(result);
      console.log('Parsed Wine Data:', parsedData);
  
      // Update state with parsed data
      setWineData(parsedData);
  
      // Send data to Google Sheets
      await appendWineDataToSheet(parsedData);
    } catch (error) {
      console.error('Failed to extract wine data:', error);
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
          console.warn(`Unrecognized field: ${field}`);
      }
    }

    return result;
  };

  const appendWineDataToSheet = async (wineData) => {
    if (!wineData.name || wineData.name.trim() === 'unknown') {
      console.log('No name provided. Skipping Google Sheets update.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/append-wine-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wineData }),
      });

      if (response.ok) {
        console.log('Wine data appended to Google Sheets successfully.');
      } else {
        console.error('Error appending wine data.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Wine Scanner</h1>
      </header>
      <div className="container">
        <button onClick={startScanning} disabled={isScanning}>Open scanner</button>
        <button onClick={stopScanning} disabled={!isScanning}>Stop scanning</button>
        <button onClick={processImage} disabled={!isScanning}>Capture wine details</button>
        <div className="camera-field-container">
          <div className="video-container">
            <video ref={videoRef} style={{ display: photoURL ? 'none' : 'block' }}></video>
          </div>
          <div className="img-container">
            {photoURL && <img src={photoURL} alt="Captured" />}
          </div>
        </div>
        <div className="data-container">
          <p>{ocrResult}</p>
          <h3>About this bottle:</h3>
          {loading ? <p>Loading...</p> : (
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
          )}
        </div>
      </div>
    </div>
  );  
};

export default App;
