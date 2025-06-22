import admin from "firebase-admin";

// Define the service account object outside the initialization logic
let serviceAccount;

// Check if the required environment variable exists
if (!process.env.GOOGLE_CREDENTIALS_BASE64) {
    // For local development, you might fall back to the JSON file
    // IMPORTANT: Make sure the secret file is in your .gitignore
    try {
        console.log("Using local JSON file for Firebase Admin.");
        serviceAccount = require("../../secret keys/bid-buy-system-firebase-adminsdk-fbsvc-712ccd008d.json");
    } catch (e) {
        throw new Error("Could not find local secret file and GOOGLE_CREDENTIALS_BASE64 env var is not set.");
    }
} else {
    // For production on Vercel, decode the environment variable
    console.log("Using Base64 credentials for Firebase Admin.");
    const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
    serviceAccount = JSON.parse(credentialsJson);
}

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Export the initialized admin instance for use in other files
export default admin;