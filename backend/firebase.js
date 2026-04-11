const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

let db;

try {
  // Initialize Firebase Admin SDK precisely with the specific service account JSON file
  const serviceAccount = require('./order-db-187da-firebase-adminsdk-fbsvc-9487887d7d.json');
  
  initializeApp({
    credential: cert(serviceAccount)
  });
  
  db = getFirestore();
  console.log("Firebase Firestore connected successfully via Service Account.");
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK. Please ensure 'order-db-187da-firebase-adminsdk-fbsvc-9487887d7d.json' is present in the backend folder and is valid.", error.message);
  process.exit(1); // Stop server execution if database connection fails
}

module.exports = { db };
