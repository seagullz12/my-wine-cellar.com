const express = require('express');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const { getFirestore, collection, doc, getDocs} = require('firebase-admin/firestore');
const { initializeApp, cert } = require("firebase-admin/app");
const path = require('path');
const sharp = require('sharp');
const multer = require('multer');

const app = express();
const port = 8080;

app.use('/static', express.static(path.join(__dirname, 'static')));

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
    contentType: 'image/webp' // Adjust based on your image type
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
        { role: 'system', content: 'You are a helpful sommelier with expert knowledge about wines.' },
        { role: 'user', content: `Extract wine details from the following text from a wine label: "${text}". Respond in the following structured format without using newlines: "Name: [wine name]; Grape: [grape]; Vintage: [vintage]; Region: [region]; Producer: [producer]; Alcohol: [alcohol content]; Classification: [quality classification]; Colour: [colour]; Nose: [nose]; Palate: [palate]; Pairing: [pairing]; description. If information is missing then complete it using your knowledge.` }
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

// Route to process both front and back images using Google Cloud Vision API
// Set up multer for handling image uploads
const upload = multer({ storage: multer.memoryStorage() });

app.post('/process-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer; // Get the uploaded image buffer

    // Process the image using Google Cloud Vision API
    const [result] = await visionClient.textDetection({ image: { content: imageBuffer.toString('base64') } });

    const extractedText = result.textAnnotations.length > 0 ? result.textAnnotations[0].description : '';

    res.status(200).json({ text: extractedText }); // Send extracted text back to the front-end
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process the image.' });
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
// Route to append wine data with both front and back images
app.post('/append-wine-data', authenticateToken, async (req, res) => {
  try {
    const { wineData, frontImageUrl, backImageUrl, id } = req.body;

    if (!wineData || !frontImageUrl || !backImageUrl || !id) {
      return res.status(400).json({ message: 'Missing wineData, frontImageUrl, backImageUrl, or id in request body' });
    }

    // Extract base64 part from both image URLs
    const frontImageUrlBase64 = frontImageUrl.split(',')[1];
    const backImageUrlBase64 = backImageUrl.split(',')[1];
    const wineName = wineData.name.replace(/\s+/g, '_');

    // Upload front desktop image to GCS
    const frontDesktopFileName = `wine-labels/${wineName}-front-desktop.webp`;
    const uploadedFrontDesktopImageUrl = await uploadImageToGCS(frontImageUrlBase64, frontDesktopFileName);

    // Upload back desktop image to GCS
    const backDesktopFileName = `wine-labels/${wineName}-back-desktop.webp`;
    const uploadedBackDesktopImageUrl = await uploadImageToGCS(backImageUrlBase64, backDesktopFileName);

    // Create mobile-optimized front image using sharp
    const frontMobileImageBuffer = await sharp(Buffer.from(frontImageUrlBase64, 'base64'))
      .resize(300) // Resize to 300px width (adjust as necessary)
      .toFormat('png') // Specify format
      .toBuffer();

    // Upload front mobile image to GCS
    const frontMobileFileName = `wine-labels/${wineName}-front-mobile.webp`;
    const uploadedFrontMobileImageUrl = await uploadImageToGCS(frontMobileImageBuffer.toString('base64'), frontMobileFileName);

    // Create mobile-optimized back image using sharp
    const backMobileImageBuffer = await sharp(Buffer.from(backImageUrlBase64, 'base64'))
      .resize(300) // Resize to 300px width (adjust as necessary)
      .toFormat('png') // Specify format
      .toBuffer();

    // Upload back mobile image to GCS
    const backMobileFileName = `wine-labels/${wineName}-back-mobile.webp`;
    const uploadedBackMobileImageUrl = await uploadImageToGCS(backMobileImageBuffer.toString('base64'), backMobileFileName);

    // Add the image URLs to the wineData object
    wineData.images = {
      front: {
        desktop: uploadedFrontDesktopImageUrl,
        mobile: uploadedFrontMobileImageUrl
      },
      back: {
        desktop: uploadedBackDesktopImageUrl,
        mobile: uploadedBackMobileImageUrl
      }
    };

    // Add wine data to Firestore
    const userId = req.user.uid;

    // Ensure the user document exists before adding wine data to sub-collection
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({});
    }

    // Proceed with adding wine data to the wines sub-collection with the provided id
    const winesCollection = userRef.collection('wines');
    await winesCollection.doc(id).set(wineData);

    res.status(200).json({
      message: 'Wine data appended to Firestore',
      response: { frontImage: uploadedFrontDesktopImageUrl, backImage: uploadedBackDesktopImageUrl },
      wineUrl: `/cellar/${id}`
    });
  } catch (error) {
    console.error('Error appending wine data:', error);
    res.status(500).json({
      message: 'Error appending wine data',
      error: error.message,
    });
  }
});

// Get wine data by ID without authentication
app.get('/get-wine-by-token', async (req, res) => {
  const token = req.query.token;

  try {
    const tokenDoc = await db.collection('sharedWineTokens').doc(token).get();

    if (!tokenDoc.exists) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const { wineId } = tokenDoc.data();

    // Now fetch the wine from the users' collections
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.get();
    console.log(userSnapshot)

    let wineData = null;

    for (const userDoc of userSnapshot.docs) {
      const wineDoc = await userDoc.ref.collection('wines').doc(wineId).get();
      if (wineDoc.exists) {
        wineData = wineDoc.data();
        break; // Found the wine, exit the loop
      }
    }

    if (!wineData) {
      return res.status(404).json({ error: 'Wine not found' });
    }

    res.json({ wine: wineData });
  } catch (error) {
    console.error('Error fetching wine by token:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all wine data for a user (requires authentication)
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
        id: doc.id,
        ...doc.data()
      }));

      res.json({ wines });
    }
  } catch (error) {
    console.error('Error fetching wine data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to delete a specific wine by ID
app.delete('/delete-wine/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // Get wine ID from the URL
    const userId = req.user.uid;

    if (!id) {
      return res.status(400).json({ error: 'Wine ID is required' });
    }

    const wineRef = db.collection('users').doc(userId).collection('wines').doc(id);

    // Check if the wine exists
    const wineDoc = await wineRef.get();
    if (!wineDoc.exists) {
      return res.status(404).json({ error: 'Wine not found' });
    }

    // Delete the wine document
    await wineRef.delete();

    res.status(200).json({ message: 'Wine deleted successfully' });
  } catch (error) {
    console.error('Error deleting wine:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to update wine data
// Add this endpoint to your server.js file

// Route to update wine data
app.put('/update-wine-data', authenticateToken, async (req, res) => {
  try {
    const { id, wineData } = req.body;
    const userId = req.user.uid;

    if (!id || !wineData) {
      return res.status(400).json({ message: 'Missing id or wineData in request body' });
    }

    const wineRef = db.collection('users').doc(userId).collection('wines').doc(id);
    const wineDoc = await wineRef.get();

    if (!wineDoc.exists) {
      return res.status(404).json({ error: 'Wine not found' });
    }

    await wineRef.update(wineData);
    const updatedWine = await wineRef.get();

    res.status(200).json({ data: updatedWine.data() });
  } catch (error) {
    console.error('Error updating wine data:', error);
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

    // Format wine data for OpenAI prompt
    const wines = querySnapshot.docs.map(doc => {
      const wineData = doc.data();
      return {
        id: doc.id,
        name: wineData.name,
        grape: wineData.grape,
        vintage: wineData.vintage,
        pairing: wineData.pairing,
        peakMaturity: wineData.peakMaturity || null, // Include peakMaturity if not null
        link: `/cellar/${doc.id}`
      };
    });

    console.log('Wines in the request:', wines);

    // Prepare wine descriptions including peakMaturity if available
    const wineDescriptions = wines.map(wine => {
      let description = `${wine.name} (${wine.grape}, ${wine.vintage})`;//- ${wine.pairing}`;
      if (wine.peakMaturity) {
        description += `. Peak maturity: ${wine.peakMaturity}`;
      }
      description += `. Wine ID: ${wine.id}`;
      return description;
    }).join('\n');
    
    // Define OpenAI API request settings
    const settings = {
      model: "gpt-4o-mini", // Using the gpt-4 model for more structured output
      temperature: 0.3, // Lower temperature to keep responses focused
      max_tokens: 500,  // Adjust token limit as needed
    };

    // Log the settings used
    console.log('OpenAI Settings:', settings);

    // Query OpenAI for recommendations based on the food and available wines
    const recommendationResponse = await openai.chat.completions.create({
      model: settings.model,
      messages: [
        {
          role: 'system',
          content: 'You are a knowledgeable sommelier who provides wine recommendations based on food and available wines. Always return a structured JSON response.'
        },
        {
          role: 'user',
          content: `Here are the wines available: \n${wineDescriptions}\n\nGiven the above wines, recommend your top 3 wines to pair with "${food}". Only return valid JSON in this format: {"best_pairing_name": "[Wine name]", "best_pairing_link": "/cellar/[Wine ID]", "best_pairing_explanation": "[Explanation]", "second_best_pairing_name": "[Wine name]", "second_best_pairing_link": "/cellar/[Wine ID]", "second_best_pairing_explanation": "[Explanation]", "third_best_pairing_name": "[Wine name]", "third_best_pairing_link": "/cellar/[Wine ID]", "third_best_pairing_explanation": "[Explanation]"}`
        }
      ],
      temperature: settings.temperature,
      max_tokens: settings.max_tokens
    });

    // Log the full OpenAI response
    console.log('Full OpenAI response:', JSON.stringify(recommendationResponse, null, 2));
    
    // Extract the response content
    let recommendationsString = recommendationResponse.choices[0].message.content;

    // Remove markdown formatting (```json and ```)
    recommendationsString = recommendationsString.replace(/```json|```/g, '').trim();

    // Log the full OpenAI response
    console.log('Full cleaned OpenAI response:', JSON.stringify(recommendationsString, null, 2));   

    // Attempt to parse the JSON response
    try {
      const recommendations = JSON.parse(recommendationsString);
      res.json({ recommendations });
    } catch (parseError) {
      console.error('Error parsing recommendations:', parseError);
      
      // Retry or fallback logic (optional)
      res.status(400).json({ error: 'Failed to parse recommendations. Please try again.' });
    }

  } catch (error) {
    console.error('Error recommending wine:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
