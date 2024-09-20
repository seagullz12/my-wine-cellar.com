import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { v4 as uuidv4 } from 'uuid'; 
import '../styles/AddWine.css';

const AddWine = () => {
    const [ocrResult, setOcrResult] = useState('');
    const [wineData, setWineData] = useState({
        name: 'unknown',
        grape: 'unknown',
        vintage: 'unknown',
        region: 'unknown',
        producer: 'unknown',
        alcoholContent: 'unknown',
        qualityClassification: 'unknown',
        colour: 'unknown',
        nose: 'unknown',
        palate: 'unknown',
        pairing: 'unknown',
    });
    const [loading, setLoading] = useState(false);
    const [photoURL, setPhotoURL] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [logMessages, setLogMessages] = useState([]);
    const [notification, setNotification] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [user, setUser] = useState(null);
    
    const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';

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

    const addLogMessage = (message) => {
        setLogMessages((prevMessages) => [...prevMessages, message]);
    };

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

    const handleFilesChange = async (event) => {
        const files = event.target.files;

        if (!files.length) {
            addLogMessage('No files selected');
            alert('No files selected.');
            return;
        }

        addLogMessage(`Files selected: ${files.length}`);

        for (const file of files) {
            await processSingleImage(file);
        }

        setNotification(`${files.length} images processed.`);
        setShowNotification(true);
    };

    const processSingleImage = async (file) => {
      addLogMessage(`Processing file: ${file.name}`);
      
      const resizedImageBlob = await resizeImage(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
          const dataUrl = reader.result;
          setPhotoURL(dataUrl);
          addLogMessage('Image resized and loaded, making API call to process image');
  
          if (user) {
              try {
                  const response = await fetch(backendURL + '/process-image', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${user.accessToken}`
                      },
                      body: JSON.stringify({ imageUrl: dataUrl }),
                  });
  
                  if (response.ok) {
                      const result = await response.json();
                      addLogMessage('OCR Result: ' + result.text);
                      const cleanedText = cleanText(result.text);
                      setOcrResult(cleanedText);
                      await extractWineData(cleanedText);
                  } else {
                      addLogMessage('Error processing image response: ' + response.statusText);
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
            .replace(/[^a-zA-Z0-9\sÀ-ÿ]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const extractWineData = async (text) => {
      setLoading(true);
      try {
          const response = await fetch(backendURL + '/extract-wine-data', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${user.accessToken}`
              },
              body: JSON.stringify({ text }),
          });
  
          if (response.ok) {
              const result = await response.json();
              const parsedData = parseWineData(result.data);
              setWineData(parsedData);
          } else {
              setOcrResult(`Error extracting wine data. Status: ${response.status}`);
              console.error('Error extracting wine data:', await response.text());
          }
      } catch (error) {
          setOcrResult(`Error: ${error.message}`);
      }
      setLoading(false);
  };
  
  // Watch for changes in wineData to call appendWineDataToFirestore
  useEffect(() => {
      if (wineData.name !== 'unknown') {
          appendWineDataToFirestore();
      }
  }, [wineData]);

  const parseWineData = (data) => {
    const result = {
        name: 'unknown',
        grape: 'unknown',
        vintage: 'unknown',
        region: 'unknown',
        producer: 'unknown',
        alcoholContent: 'unknown',
        qualityClassification: 'unknown',
        colour: 'unknown',
        nose: 'unknown',
        palate: 'unknown',
        pairing: 'unknown',
    };

    // Match the name separately
    const nameMatch = data.match(/Name:\s*([^;]+)/);
    if (nameMatch) {
        result.name = nameMatch[1].trim();
    }

    const regex = /([^:;]+):\s*([^;]+)/g;
    let match;

    while ((match = regex.exec(data)) !== null) {
        const field = match[1].toLowerCase().trim();
        const value = match[2].trim();

        switch (field) {
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
            case 'quality classification':
                result.qualityClassification = value;
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
                // Skip logging for fields not recognized, but allow for additional fields
                if (!Object.keys(result).includes(field)) {
                    console.log(`Unrecognized field: ${field}`);
                }
        }
    }

    return result;
};

    const appendWineDataToFirestore = async () => {
        if (!wineData.name || wineData.name.trim() === 'unknown') {
            setOcrResult('No name provided. Skipping Firestore update.');
            return;
        }
        const id = uuidv4();

        try {
            console.log("Uploading wine data to Firestore:", { wineData, imageUrl: photoURL, id }); // Debug log
            const response = await fetch(backendURL + '/append-wine-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                },
                body: JSON.stringify({ wineData, imageUrl: photoURL, id }),
            });

            if (response.ok) {
                const wineUrl = `${backendURL}/cellar/${id}`;
                setNotification(`"${wineData.name}" has been added to your cellar. View it <a href="${wineUrl}" target="_blank">here</a>.`);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
            } else {
                setOcrResult(`Error appending wine data. Status: ${response.status}`);
            }
        } catch (error) {
            setOcrResult(`Error: ${error.message}`);
        }
    };

    return (
        <div className="AddWine">
            <div className="container">
                {isMobile ? (
                    <>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFilesChange} 
                            style={{ display: 'none' }} 
                            id="takePhotoInput"
                            multiple
                        />
                        <label htmlFor="takePhotoInput" className="custom-button">Scan Wine Labels</label>

                        {showNotification && (
                            <div className="notification" dangerouslySetInnerHTML={{ __html: notification }} />
                        )}

                        <div className="img-container">
                            {photoURL && <img src={photoURL} alt="Captured" />}
                        </div>
                    </>
                ) : (
                    <p>Camera scanning not available on desktop.</p>
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
                                <li><strong>Quality Classification:</strong> {wineData.qualityClassification}</li>
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
            </div>
        </div>
    );
};

export default AddWine;
