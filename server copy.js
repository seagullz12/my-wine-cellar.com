const express = require('express');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3001;

// Set up the path to your credentials.json file
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Create a client for the Google Cloud Vision API
const visionClient = new ImageAnnotatorClient({ keyFilename: CREDENTIALS_PATH });

// Initialize Google Sheets API client
const sheets = google.sheets({
  version: 'v4',
  auth: new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  }),
});

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Route to process image using Google Cloud Vision API
app.post('/process-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const base64Image = imageUrl.split(',')[1];

    const [result] = await visionClient.textDetection({
      image: { content: base64Image },
    });

    const textAnnotations = result.textAnnotations;
    const text = textAnnotations.length > 0 ? textAnnotations[0].description : '';

    res.json({ text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to append wine data to Google Sheets
app.post('/append-wine-data', async (req, res) => {
  try {
    const { wineData } = req.body;

    const spreadsheetId = '1CZkEZ7_DLQDWlJZLqNu45V_iyj4ihblGubB88t7coDc'; // Replace with your Google Sheets ID
    const range = 'Inventory!A2:Z'; // Define the range where you want to append the data

    const values = [Object.values(wineData)];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values,
      },
    });

    res.status(200).send('Wine data appended to Google Sheets');
  } catch (error) {
    console.error('Error appending wine data:', error);
    res.status(500).send('Error appending wine data');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
