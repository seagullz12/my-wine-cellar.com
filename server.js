const express = require('express');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const { getFirestore, collection, doc, getDocs} = require('firebase-admin/firestore');
const { initializeApp, cert } = require("firebase-admin/app");

const app = express();
const port = 8080;

const serviceAccount = {
    type: process.env.FIREBASE_type,
    project_id: process.env.FIREBASE_project_id,
    private_key_id: process.env.FIREBASE_private_key_id,
    private_key: process.env.FIREBASE_private_key,
    client_email: process.env.FIREBASE_client_email,
    client_id: process.env.FIREBASE_client_id,
    auth_uri: process.env.FIREBASE_auth_uri,
    token_uri: process.env.FIREBASE_token_uri,
    auth_provider_x509_cert_url: process.env.FIREBASE_auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.FIREBASE_client_x509_cert_url,
    universe_domain: process.env.FIREBASE_universe_domain
  }

const firebaseApp = initializeApp(serviceAccount);
const db = getFirestore(firebaseApp, "wine-scanner") 

// Initialize Google Cloud Storage
const storage = new Storage(); //
const bucketName = 'wine-label-images';
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

// Middleware to check Firebase Auth Token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach the user object to the request
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.sendStatus(403);
  }
};

// Create a client for the Google Cloud Vision API
const visionClient = new ImageAnnotatorClient({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
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
app.post('/process-image', authenticateToken, async (req, res) => {
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
app.post('/extract-wine-data', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const extractedData = await getWineDataFromText(text);
    res.json({ data: extractedData });
  } catch (error) {
    console.error('Error extracting wine data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to append wine data to Firestore
app.post('/append-wine-data', authenticateToken, async (req, res) => {
  try {
    const { wineData, imageUrl, id } = req.body; // Expecting id in request body

    if (!wineData || !imageUrl || !id) {
      return res.status(400).json({ message: 'Missing wineData, imageUrl, or id in request body' });
    }

    // Upload image to GCS
    const imageUrlBase64 = imageUrl.split(',')[1]; // Extract base64 part
    const wineName = wineData.name.replace(/\s+/g, '_');
    const fileName = `wine-labels/${wineName}.png`; // Generate a unique file name
    const uploadedImageUrl = await uploadImageToGCS(imageUrlBase64, fileName);

    // Add the image URL to the wineData object
    wineData['Image URL'] = uploadedImageUrl;

    // Add wine data to Firestore
    const userId = req.user.uid;

    // Ensure the user document exists before adding wine data to sub-collection
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // If the user document doesn't exist, create an empty document for the user
      await userRef.set({}); // You can also initialize with default values if needed
    }

    // Proceed with adding wine data to the wines sub-collection with the provided id
    const winesCollection = userRef.collection('wines');
    await winesCollection.doc(id).set(wineData); // Use `doc(id)` to set the document with the provided id

    res.status(200).json({
      message: 'Wine data appended to Firestore',
      response: uploadedImageUrl,
      wineUrl: `/cellar/${id}` // Return the URL path
    });
  } catch (error) {
    console.error('Error appending wine data:', error);
    res.status(500).json({
      message: 'Error appending wine data',
      error: error.message,
    });
  }
});

// Get all wine data for a user
// Route to get wine data with optional ID query parameter
app.get('/get-wine-data', authenticateToken, async (req, res) => {
  try {
    const { id } = req.query; // Get ID from query parameters
    const userId = req.user.uid;

    if (id) {
      // Fetch a specific wine by ID
      const wineDoc = await db.collection('users').doc(userId).collection('wines').doc(id).get();

      if (wineDoc.exists) {
        res.json({ wine: wineDoc.data() });
      } else {
        res.status(404).json({ error: 'Wine not found' });
      }
    } else {
      // Fetch all wines
      const winesRef = db.collection('users').doc(userId).collection('wines');
      const querySnapshot = await winesRef.get();

      if (querySnapshot.empty) {
        return res.status(404).json({ message: 'No wines found' });
      }

      const wines = querySnapshot.docs.map(doc => ({
        id: doc.id, // Include the document ID for linking
        ...doc.data()
      }));

      res.json({ wines });
    }
  } catch (error) {
    console.error('Error fetching wine data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get wine recommendations based on food input
app.post('/recommend-wine', authenticateToken, async (req, res) => {
  try {
    const { food } = req.body;

    // Fetch wines from Firestore
    const userId = req.user.uid;
    const winesRef = db.collection('users').doc(userId).collection('wines');
    const querySnapshot = await winesRef.get();

    const wines = querySnapshot.docs.map(doc => ({
      name: doc.data().name,
      grape: doc.data().grape,
      vintage: doc.data().vintage,
      region: doc.data().region,
      producer: doc.data().producer,
      alcoholContent: doc.data().alcoholContent,
      colour: doc.data().colour,
      nose: doc.data().nose,
      palate: doc.data().palate,
      pairing: doc.data().pairing
    }));
    
    console.log('Wines in the request', wines);
    // Prepare wine descriptions for the prompt
    const wineDescriptions = wines.map(wine => (
      `${wine.name} (${wine.grape}, ${wine.vintage}) - ${wine.pairing}`
    )).join('\n');

    // Define OpenAI API request settings
    const settings = {
      model: "gpt-4o-mini", // Or another suitable model
      temperature: 0.7, // Adjust temperature as needed
      max_tokens: 300 // Adjust token limit as needed
    };

    // Log the settings used
    console.log('OpenAI Settings:', settings);

    // Query OpenAI for recommendations based on the food and available wines
    const recommendationResponse = await openai.chat.completions.create({
      model: settings.model,
      messages: [
        { role: 'system', content: 'You are a knowledgeable sommelier who provides wine recommendations based on food and available wines.' },
        { role: 'user', content: `Given the following wines: ${wineDescriptions}, recommend your top 3 wines that pair well with the following food and explain why: "${food}". Respond in the following format: {"best_pairing_name": "[Wine name]", "best_pairing_explanation": "[Explanation]",  "second_best_pairing_name": "[Wine name]","second_best_pairing_explanation": "[Explanation]","third_best_pairing_name": "[Wine name]","third_best_pairing_explanation": "[Explanation]"` }
      ],
      temperature: settings.temperature,
      max_tokens: settings.max_tokens
    });
    
    // Log the full OpenAI response
    console.log('Full OpenAI response:', JSON.stringify(recommendationResponse, null, 2));

    // Log the tokens used
    const totalTokens = recommendationResponse.usage.total_tokens;
    console.log(`Total tokens used: ${totalTokens}`);

    // Extract and send recommendations
    const recommendations = recommendationResponse.choices[0].message.content;
    res.json({ recommendations });

  } catch (error) {
    console.error('Error recommending wine:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
