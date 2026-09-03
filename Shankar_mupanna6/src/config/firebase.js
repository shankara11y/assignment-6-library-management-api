const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey) {
  // Format escaped newlines in private key string
  privateKey = privateKey.replace(/\\n/g, '\n');
}

// Verify mandatory Firebase environment variables
if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ [Firebase Config Error]: Missing required Firebase credentials in .env file!');
  console.error('⚠️  Please provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env file.');
}

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId || 'missing-project-id',
        clientEmail: clientEmail || 'missing-client-email',
        privateKey: privateKey || 'missing-private-key',
      }),
    });
    console.log('✅ Firebase Admin SDK initialized successfully.');
  }
} catch (error) {
  console.error('❌ [Firebase Initialization Failed]:', error.message);
  console.error('⚠️  Please ensure valid Firebase service account details are set in .env');
}

// Firestore Database Instance - Mandatory Database for this project
const db = admin.firestore();

module.exports = { admin, db };
