const express = require('express');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 8080;

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

// Route to append wine data and image URL to Google Sheets
app.post('/append-wine-data', async (req, res) => {
  try {
    const { wineData, imageUrl } = req.body;

    const spreadsheetId = '1CZkEZ7_DLQDWlJZLqNu45V_iyj4ihblGubB88t7coDc'; // Replace with your Google Sheets ID
    const range = 'Inventory!A2:Z'; // Define the range where you want to append the data

    // Add the image URL to the wineData object
    wineData['Image URL'] = imageUrl;

    const values = [Object.values(wineData)];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values,
      },
    });

    console.log('Google Sheets API response:', response.data);

    res.status(200).json({
      message: 'Wine data appended to Google Sheets',
      response: response.data,
    });
  } catch (error) {
    console.error('Error appending wine data:', error);
    res.status(500).json({
      message: 'Error appending wine data',
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
