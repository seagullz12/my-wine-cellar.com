const express = require('express');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 8080;
const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const bucketName = 'wine-label-images'; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

const uploadImageToGCS = async (imageData, fileName) => {
  const buffer = Buffer.from(imageData, 'base64');

  const file = bucket.file(fileName);
  const stream = file.createWriteStream({
    resumable: false,
    contentType: 'image/png' // Adjust based on your image type
  });

  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${bucketName}/${fileName}`);
    });
    stream.end(buffer);
  });
};

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Create a client for the Google Cloud Vision API
const visionClient = new ImageAnnotatorClient({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// Initialize Google Sheets API client
const sheets = google.sheets({
  version: 'v4',
  auth: new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  }),
});

// Initialize OpenAI client
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Function to get wine data from text using OpenAI
const getWineDataFromText = async (text) => {
  const settings = {
    model: "gpt-4o-mini",
    temperature: 0.5,
    max_tokens: 300
  };
  try {
    const response = await openai.chat.completions.create({
      model: settings.model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant with expert knowledge about wines.' },
        { role: 'user', content: `Extract wine details from the following text from a wine label: "${text}". Respond in the following structured format without using newlines: "Name: [wine name]; Grape: [grape]; Vintage: [vintage]; Region: [region]; Producer: [producer]; Alcohol Content: [alcohol content]; Colour: [colour]; Nose: [nose]; Palate: [palate]; Pairing: [pairing]. If information is missing then complete it using your knowledge.` }
      ],
      temperature: settings.temperature,
      max_tokens: settings.max_tokens
    });
    // Log the entire response object
    console.log('OpenAI Settings:', settings);
    console.log('API Response:', response);

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching wine data:', error);
    throw error;
  }
};

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

// Route to get wine data from text using OpenAI
app.post('/extract-wine-data', async (req, res) => {
  try {
    const { text } = req.body;
    const extractedData = await getWineDataFromText(text);
    res.json({ data: extractedData });
  } catch (error) {
    console.error('Error extracting wine data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/append-wine-data', async (req, res) => {
  try {
    const { wineData, imageUrl } = req.body;

    // Upload image to GCS
    const imageUrlBase64 = imageUrl.split(',')[1]; // Extract base64 part
    wineName = wineData.name.replace(/\s+/g, '_')
    const fileName = `wine-labels/${wineName}.png`; // Generate a unique file name
    const uploadedImageUrl = await uploadImageToGCS(imageUrlBase64, fileName);

    // Add the image URL to the wineData object
    wineData['Image URL'] = uploadedImageUrl;

    // Append data to Google Sheets
    const spreadsheetId = '1CZkEZ7_DLQDWlJZLqNu45V_iyj4ihblGubB88t7coDc'; // Replace with your Google Sheets ID
    const range = 'Inventory!A2:Z';

    const values = [Object.values(wineData)];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values,
      },
    });

    res.status(200).json({
      message: 'Wine data appended to Google Sheets',
      response: uploadedImageUrl,
    });
  } catch (error) {
    console.error('Error appending wine data:', error);
    res.status(500).json({
      message: 'Error appending wine data',
      error: error.message,
    });
  }
});


app.get('/get-wine-data', async (req, res) => {
  try {
    const spreadsheetId = '1CZkEZ7_DLQDWlJZLqNu45V_iyj4ihblGubB88t7coDc';
    const range = 'Inventory!A2:Z'; // Adjust range as needed

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    const wines = rows.map(row => ({
      name: row[0],
      grape: row[1],
      vintage: row[2],
      region: row[3],
      producer: row[4],
      alcoholContent: row[5],
      colour: row[6],
      nose: row[7],
      palate: row[8],
      pairing: row[9],
      imageUrl: row[10], // Assuming this is where the image URL is stored
    }));

    res.json({ wines });
  } catch (error) {
    console.error('Error fetching wine data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
