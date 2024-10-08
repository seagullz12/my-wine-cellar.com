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
// const sharp = require('sharp');
const multer = require('multer');
const { generateSitemap } = require('./sitemap');
const { z } = require('zod');
const { zodResponseFormat } = require('openai/helpers/zod');

const app = express();
const port = 8080;

app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(generateSitemap());
});

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
  const WineDataExtraction = z.object({
    name: z.string(),
    grape: z.array(z.string()),
    vintage: z.string(),
    region:  z.string(),
    country:  z.string(),
    producer: z.string(),
    alcohol: z.string(),
    classification: z.array(z.string()),
    colour: z.string(),
    nose: z.array(z.string()),
    palate: z.array(z.string()),
    pairing: z.array(z.string()),
    terroir: z.array(z.string()),
    description: z.string(),
    optimal_drinking_window: z.object({lower: z.string(), upper: z.string()})
  });

  const settings = {
    model: "gpt-4o-mini",
    temperature: 0.5,
    max_tokens: 300
  };
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: settings.model,
      messages: [
        { role: 'system', content: 'You are a helpful sommelier with expert knowledge about wines.' },
        { role: 'user', content: `Extract wine details from the following text from a wine label: "${text}". Respons JSON format. If information is missing then complete it using your knowledge.` }
      ],
      temperature: settings.temperature,
      max_tokens: settings.max_tokens,
      response_format: zodResponseFormat(WineDataExtraction, "wine_data_extraction"),
    });
    // Log the entire response object
    console.log('OpenAI Settings:', settings);
    console.log('API Response:', completion);

    const extracted_wine_data = completion.choices[0].message.parsed;

    console.log('open ai response: ',extracted_wine_data);
    return extracted_wine_data;
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

// Route to append wine data to Firestores
app.post('/append-wine-data', authenticateToken, async (req, res) => {
  try {
    const { wineData, frontImageUrl, backImageUrl, id } = req.body;

    if (!wineData || !id) {
      return res.status(400).json({ message: 'Missing wineData, or id in request body' });
    }

    const wineName = wineData.name.replace(/\s+/g, '_');
    let uploadedFrontDesktopImageUrl = null;
    let uploadedBackDesktopImageUrl = null;
    let uploadedFrontMobileImageUrl = null;
    let uploadedBackMobileImageUrl = null;

    // Process front image if available
    if (frontImageUrl) {
      const frontImageUrlBase64 = frontImageUrl.split(',')[1];  // Ensure frontImageUrl exists before splitting

      if (frontImageUrlBase64) {
        // Upload front desktop image to GCS
        const frontDesktopFileName = `wine-labels/${wineName}-front-desktop.webp`;
        uploadedFrontDesktopImageUrl = await uploadImageToGCS(frontImageUrlBase64, frontDesktopFileName);

        // Create mobile-optimized front image using sharp -- already done before processing.
        // const frontMobileImageBuffer = await sharp(Buffer.from(frontImageUrlBase64, 'base64'))
        //   .resize(300) // Resize to 300px width (adjust as necessary)
        //   .toFormat('webp') // Specify format
        //   .toBuffer();

        // Upload front mobile image to GCS 
        const frontMobileFileName = `wine-labels/${wineName}-front-mobile.webp`;
        uploadedFrontMobileImageUrl = await uploadImageToGCS(frontImageUrlBase64.toString('base64'), frontMobileFileName);
      }
    }

    // Process back image if available
    if (backImageUrl) {
      const backImageUrlBase64 = backImageUrl.split(',')[1];  // Ensure backImageUrl exists before splitting

      if (backImageUrlBase64) {
        // Upload back desktop image to GCS
        const backDesktopFileName = `wine-labels/${wineName}-back-desktop.webp`;
        uploadedBackDesktopImageUrl = await uploadImageToGCS(backImageUrlBase64, backDesktopFileName);

        // Create mobile-optimized back image using sharp -- already done before processing.
        // const backMobileImageBuffer = await sharp(Buffer.from(backImageUrlBase64, 'base64'))
        //   .resize(300) // Resize to 300px width (adjust as necessary)
        //   .toFormat('webp') // Specify format
        //   .toBuffer();

        // Upload back mobile image to GCS
        const backMobileFileName = `wine-labels/${wineName}-back-mobile.webp`;
        uploadedBackMobileImageUrl = await uploadImageToGCS(backImageUrlBase64.toString('base64'), backMobileFileName);
      }
    }

    // Add the image URLs to the wineData object if they exist
    wineData.images = {
      front: uploadedFrontDesktopImageUrl ? {
        desktop: uploadedFrontDesktopImageUrl,
        mobile: uploadedFrontMobileImageUrl
      } : null,
      back: uploadedBackDesktopImageUrl ? {
        desktop: uploadedBackDesktopImageUrl,
        mobile: uploadedBackMobileImageUrl
      } : null
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
    const { id, sampleSize } = req.query; // Get ID and sampleSize from query parameters
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

      // Map the documents to an array and apply the sampleSize limit
      const wines = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Limit the number of wines returned if sampleSize is provided
      if (sampleSize) {
        const limit = parseInt(sampleSize, 10);
        if (!isNaN(limit)) {
          res.json({ wines: wines.slice(0, limit) });
        } else {
          return res.status(400).json({ error: 'Invalid sampleSize parameter' });
        }
      } else {
        res.json({ wines });
      }
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

// Function to get wine pairing recommendations
const getWinePairingRecoFromFood = async (food, wines) => {
  const WineRecommendationExtraction = z.object({
    "1": z.object({
      recommendation_rank: z.number(),
      id: z.string(),
      explanation: z.string(),
    }),
    "2": z.object({
      recommendation_rank: z.number(),
      id: z.string(),
      explanation: z.string(),
    }),
    "3": z.object({
      recommendation_rank: z.number(),
      id: z.string(),
      explanation: z.string(),
    })
  });
  
  console.log('wines:', wines)
  // Prepare wine descriptions for OpenAI prompt
  const wineDescriptions = wines.map(wine => {
    return `id: ${wine.id}, wine features: [grapes: ${wine.grape}, vintage: ${wine.vintage}, palate: ${wine.palate}, nose: ${wine.nose}, alcohol: ${wine.alcohol}, drinking window: ${wine.drinkingWindow.lower} until ${wine.drinkingWindow.upper}].`;
  }).join('\n');
  console.log('prompt: ',wineDescriptions)
//  console.log('Wines in the request: ', wines);

  const settings = {
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 500,
  };

  console.log('OpenAI Settings:', settings);

  // Call OpenAI for wine pairing recommendations
  const completion = await openai.beta.chat.completions.parse({
    model: settings.model,
    messages: [
      {
        role: 'system',
        content: 'You are an expert sommelier. Provide wine recommendations based on available wines and food, returning only valid JSON.'
      },
      {
        role: 'user',
        content: `Available wines:\n${wineDescriptions}\nRecommend the top 3 wines to pair with "${food}" and explain why. Return 3 json objects.`
      }
    ],
    temperature: settings.temperature,
    max_tokens: settings.max_tokens,
    response_format: zodResponseFormat(WineRecommendationExtraction, "wine_recommendation_extraction"),
  });

  const recommended_wine_data = completion.choices[0].message.parsed;
  console.log('OpenAI response:', recommended_wine_data);
  return recommended_wine_data;
};

// Route to recommend wines based on food
app.post('/recommend-wine', authenticateToken, async (req, res) => {
  try {
    const { food } = req.body;

 // Fetch wines from Firestore
const userId = req.user.uid;
const winesRef = db.collection('users').doc(userId).collection('wines');
const querySnapshot = await winesRef.get();

// Format wine data for OpenAI prompt and create a map for lookup
const wines = querySnapshot.docs.map(doc => {
  const wineData = doc.data(); // Get the wine data
  return { ...wineData, id: doc.id }; // Return the data along with the document ID
});

// Create a map of wine ID to wine data for easy access
const wineDataMap = wines.reduce((acc, wine) => {
  acc[wine.id] = wine; // Use document ID as the key
  return acc;
}, {});

// Get wine recommendations based on food
const recommendations = await getWinePairingRecoFromFood(food, wines);

// Match recommendations with wine data
const detailedRecommendations = Object.keys(recommendations).map(key => {
  const { id, recommendation_rank, explanation } = recommendations[key];
  const wineDetails = wineDataMap[id]; // Lookup the wine details from the map

  // Ensure that the ID from recommendations matches the wine document ID
  return {
    recommendation_rank,
    id, // This should correspond to wineData.id
    explanation,
    wineDetails, // Include the matched wine details
  };
});

    console.log('returned matches: ',detailedRecommendations)
    return res.json({ recommendations: detailedRecommendations });

  } catch (error) {
    console.error('Error recommending wine:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Secure route to fetch user profile data
app.get('/get-user-profile', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.uid; // Get the user ID from the decoded token

    // Fetch user data from the 'users/{uid}/profile' collection
    const userDoc = await db.collection('users').doc(uid).collection('user').doc('profileInfo').get();
    if (!userDoc.exists) {
      return res.status(404).send('User profile not found');
    }

    const userData = userDoc.data();
    res.status(200).json(userData); // Return user data as JSON
  } catch (error) {
    console.error('Error fetching user profile data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to update user profile
app.post('/update-user-profile', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.uid; // Get the user ID from the decoded token
    const userData = req.body; // Expect user data in the request body

    // Update user data in the 'users/{uid}/profile' collection
    await db.collection('users').doc(uid).collection('user').doc('profileInfo').set(userData, { merge: true }); // Use set with merge to update
    res.status(200).json({ message: 'Profile updated successfully' }); // Send JSON response
    
  } catch (error) {
    console.error('Error updating user profile data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to add a wine for sale
app.post('/add-listing', authenticateToken, async (req, res) => {
  try {
    const { wineId, wineDetails, sellerDetails, price, quantity, condition, additionalInfo } = req.body;
    sellerDetails.sellerId = req.user.uid; // set the sellerId to the user id of the caller.

    // Validate required fields
    if (!wineId || !price || !quantity ) {
      return res.status(400).json({ message: 'Missing required fields: wineId, price, quantity.' });
    }

    // Create listing data
    const listingData = {
      wineDetails,
      sellerDetails,
      wineId,
      price,
      quantity,
      condition,
      additionalInfo: additionalInfo || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Create or update the listing directly in the 'listings' collection
    const listingRef = db.collection('listings').doc(); // Auto-generate ID for the listing
    await listingRef.set(listingData);

    console.log('New listing created successfully:', listingData);

    // Return the created listing
    return res.status(201).json({ message: 'Wine listed for sale successfully!', data: listingData });
  } catch (error) {
    console.error('Error processing listing creation:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Route to update a wine listing
app.put('/update-listing/:id', authenticateToken, async (req, res) => {
  try {
    const listingId = req.params.id; // Get the listing ID from the URL parameters
    const { wineDetails, sellerDetails, price, quantity, condition, additionalInfo } = req.body;

    // Validate required fields
    if (!listingId || !price || !quantity) {
      return res.status(400).json({ message: 'Missing required fields: price, quantity.' });
    }

    // Fetch the listing document from Firestore
    const listingRef = db.collection('listings').doc(listingId);
    const listingDoc = await listingRef.get();

    // Check if the listing exists
    if (!listingDoc.exists) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    const listingData = {
      wineDetails,
      sellerDetails: { ...sellerDetails, sellerId: req.user.uid }, 
      price,
      quantity,
      condition,
      additionalInfo: additionalInfo || '',
      updatedAt: new Date().toISOString(),
    };

    // Update the listing document
    await listingRef.update(listingData);

    console.log('Listing updated successfully:', listingData);

    // Return the updated listing
    return res.status(200).json({ message: 'Listing updated successfully!', data: listingData });
  } catch (error) {
    console.error('Error updating listing:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Route to update a listing status (activate/deactivate)
app.patch('/update-listing-status/:listingId', authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { status } = req.body; // expecting 'active' or 'inactive'

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Status must be either active or inactive.' });
    }

    // Get the listing reference
    const listingRef = db.collection('listings').doc(listingId);

    // Check if the listing exists
    const listingDoc = await listingRef.get();
    if (!listingDoc.exists) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    // Update the status field
    await listingRef.update({
      status: status,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({ message: `Listing status updated to ${status}` });
  } catch (error) {
    console.error('Error updating listing status:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


/* MARKETPLACE ROUTES START HERE */
app.get('/marketplace', authenticateToken, async (req, res) => {
  try {
    const { sampleSize, myListings } = req.query;  // Get sampleSize and myListings from query params
    const userId = req.user.uid;
    
    // Create a base reference for the listings collection
    let listingsRef = db.collection('listings').orderBy('createdAt', 'desc'); // Order by creation time

    // Check if 'myListings' is true to fetch only the user's listings
    if (myListings === 'true') {
      listingsRef = listingsRef.where('sellerDetails.sellerId', '==', userId);
    } else {
      // If 'myListings' is false, fetch only active listings
      listingsRef = listingsRef.where('status', '==', 'active');
    }

    // If sampleSize is provided and is a number, apply limit()
    if (sampleSize && !isNaN(sampleSize)) {
      listingsRef = listingsRef.limit(parseInt(sampleSize, 10));  // Convert to integer and apply limit
    }

    const listingsSnapshot = await listingsRef.get();

    if (listingsSnapshot.empty) {
      return res.status(200).json({ wines: [] });
    }

    // Extract listing data directly
    const winesForSale = listingsSnapshot.docs.map(listingDoc => {
      const listingData = listingDoc.data();
      return {
        ...listingData,
        sellerDetails: listingData.sellerDetails, 
        wineDetails: listingData.wineDetails,  
        listingId: listingDoc.id    
      };
    });

    // Send response
    res.status(200).json({ wines: winesForSale });
  } catch (error) {
    console.error('Error fetching marketplace data:', error);
    res.status(500).json({ error: 'Failed to retrieve marketplace data.' });
  }
});


// Manage Listings Route
app.get('/my-listings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid; // Assume authenticateToken attaches user ID to request
    const listingsSnapshot = await db.collection('listings').where('sellerId', '==', userId).get();

    if (listingsSnapshot.empty) {
      console.log('No listings found for the current user.');
      return res.status(200).json({ wines: [] });
    }

    let userWinesForSale = [];

    for (const listingDoc of listingsSnapshot.docs) {
      const listingData = listingDoc.data();
      const wineDoc = await db.collection('users')
                                .doc(userId)
                                .collection('wines')
                                .doc(listingData.wineId)
                                .get();

      if (wineDoc.exists) {
        const wineData = wineDoc.data();
        const wineForSale = {
          ...listingData,
          wineDetails: wineData,
        };
        userWinesForSale.push(wineForSale);
      } else {
        console.warn(`Wine document not found for ID: ${listingData.wineId} from user ID: ${userId}`);
      }
    }

    res.status(200).json({ wines: userWinesForSale });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Failed to retrieve user listings.' });
  }
});

// In your server (e.g., app.js or routes/marketplace.js)
app.delete('/delete-listing/:listingId', authenticateToken, async (req, res) => {
  const { listingId } = req.params;
  const userId = req.user.uid;

  try {
    // Fetch the listing to ensure the user is the owner
    const listingDoc = await db.collection('listings').doc(listingId).get();

    if (!listingDoc.exists) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listingData = listingDoc.data();

    // Check if the logged-in user is the owner of the listing
    if (listingData.sellerDetails.sellerId !== userId) {
      console.log('sellerId: ',listingData.sellerDetails.sellerId, 'userId: ', userId)
      return res.status(403).json({ error: 'You are not authorized to delete this listing' });
    }

    // Delete the listing from the 'listings' collection
    await db.collection('listings').doc(listingId).delete();

    return res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return res.status(500).json({ error: 'Failed to delete the listing' });
  }
});

// Route to handle purchase requests
app.post('/send-purchase-request', authenticateToken, async (req, res) => {
  console.log('Received purchase request:', req.body); // Log incoming request data

  try {
      const { wineId, wineName, quantity, buyerId, price, totalPrice, sellerId } = req.body;

      if (!wineId || !buyerId || !totalPrice || !sellerId) {
          console.warn('Missing required fields:', req.body);
          return res.status(400).json({ message: 'Missing required fields' });
      }

      // Marketplace fee (assuming 10%)
      const marketplaceFeePercentage = 0.10;
      const marketplaceFee = totalPrice * marketplaceFeePercentage;
      const sellerEarnings = totalPrice - marketplaceFee;

      // Create a new document in Firestore under 'purchaseRequests'
      const purchaseRequestRef = db.collection('purchaseRequests').doc(); // Auto-generate ID for the listing

      const newPurchaseRequest = {
          purchaseRequestId: purchaseRequestRef.id,
          wineId: wineId,
          wineName: wineName,
          quantity: quantity,
          buyerId: buyerId,
          sellerId: sellerId,
          price: price,
          totalPrice: totalPrice,
          marketplaceFee: marketplaceFee,
          sellerEarnings: sellerEarnings,
          status: 'pending_confirmation', // Initial status of the purchase
          createdAt: new Date().toISOString(),
      };

      console.log('New purchase request data:', newPurchaseRequest); // Log new purchase request data

      await purchaseRequestRef.set(newPurchaseRequest);

      console.log('Purchase request saved successfully.'); // Log successful save

      // Respond with the new purchase request
      res.status(201).json({
          message: 'Purchase request created successfully',
          purchaseRequest: newPurchaseRequest,
      });
  } catch (error) {
      console.error('Error creating purchase request:', error); // Log error details
      res.status(500).json({ message: 'Error creating purchase request', error: error.message });
  }
});

// Route to fetch pending purchase requests for a seller
app.get('/get-purchase-requests', authenticateToken, async (req, res) => {
  const sellerId = req.query.sellerId; // Get sellerId from query parameters

  try {
      const purchaseRequestsSnapshot = await db.collection('purchaseRequests')
          .where('sellerId', '==', sellerId) // Filter by sellerId
          .get();

      if (purchaseRequestsSnapshot.empty) {
          console.log('No purchase requests found for seller:', sellerId);
          return res.status(200).json({ purchaseRequests: [] });
      }

      const purchaseRequests = [];
      purchaseRequestsSnapshot.forEach(doc => {
          purchaseRequests.push({ id: doc.id, ...doc.data() }); // Include document ID
      });

      console.log(`Fetched ${purchaseRequests.length} purchase requests for seller ${sellerId}.`);
      res.status(200).json({ purchaseRequests });
  } catch (error) {
      console.error('Error fetching purchase requests:', error);
      res.status(500).json({ message: 'Error fetching purchase requests', error: error.message });
  }
});

app.get('/get-purchase-request/:purchaseRequestId', authenticateToken, async (req, res) => {
  const { purchaseRequestId } = req.params; // Get the purchaseRequestId from URL params

  try {
      // Fetch the document with the provided purchaseRequestId (document ID)
      const purchaseRequestRef = db.collection('purchaseRequests').doc(purchaseRequestId);
      const purchaseRequestSnapshot = await purchaseRequestRef.get();

      if (!purchaseRequestSnapshot.exists) {
          console.log('Purchase request not found for id:', purchaseRequestId);
          return res.status(404).json({ message: 'Purchase request not found' });
      }

      // Return the document data along with its ID
      const purchaseRequest = { id: purchaseRequestSnapshot.id, ...purchaseRequestSnapshot.data() };
      res.status(200).json({ purchaseRequest });
  } catch (error) {
      console.error('Error fetching purchase request:', error);
      res.status(500).json({ message: 'Error fetching purchase request', error: error.message });
  }
});

app.post('/seller/confirm-sale', async (req, res) => {
  try {
    const { purchaseRequestId, sellerId } = req.body;
    console.log('purchaseRequestId: ',purchaseRequestId)
    if (!purchaseRequestId || !sellerId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch the purchase request document from Firestore
    const purchaseRequestRef = db.collection('purchaseRequests').doc(purchaseRequestId);
    
    const purchaseRequestSnapshot = await purchaseRequestRef.get();

    if (!purchaseRequestSnapshot.exists) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const purchaseRequestData = purchaseRequestSnapshot.data();

    // Ensure that the correct seller is confirming the sale
    if (purchaseRequestData.sellerId !== sellerId) {
      return res.status(403).json({ message: 'Unauthorized seller' });
    }

    // Ensure the status is still pending confirmation
    if (purchaseRequestData.status !== 'pending_confirmation') {
      return res.status(400).json({ message: 'Purchase request already confirmed or invalid status' });
    }

    // Capture the payment on Stripe
    const paymentIntentId = purchaseRequestData.paymentIntentId;
    const paymentIntent = 'yes'; 
    // await stripe.paymentIntents.capture(paymentIntentId);

    // Update the purchase request in Firestore to reflect the confirmation
    await purchaseRequestRef.update({
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      paymentCaptured: true,
    });

    // Respond with the updated purchase request
    res.status(200).json({
      message: 'Sale confirmed successfully',
      purchaseRequestId: purchaseRequestId,
      paymentIntent: paymentIntent,
    });
  } catch (error) {
    console.error('Error confirming sale:', error);
    // Ensure that we always return a JSON response
    res.status(500).json({ message: 'Error confirming sale', error: error.message });
  }
});

// Start your server (add appropriate port)
app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
