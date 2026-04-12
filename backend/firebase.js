const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let db;

try {
  // Prevent re-initialization if already done (e.g. hot-reload)
  if (getApps().length === 0) {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // ── Production (Render) ──
      // Paste the entire service account JSON as a single env var
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = cert(serviceAccount);
      console.log('Firebase: using FIREBASE_SERVICE_ACCOUNT env variable.');
    } else {
      // ── Local development ──
      // Falls back to the JSON file on disk
      const serviceAccount = require('./order-db-187da-firebase-adminsdk-fbsvc-9487887d7d.json');
      credential = cert(serviceAccount);
      console.log('Firebase: using local service account JSON file.');
    }

    initializeApp({ credential });
  }

  db = getFirestore();
  console.log('Firebase Firestore connected successfully via Service Account.');
} catch (error) {
  console.error(
    '❌ Failed to initialize Firebase Admin SDK.',
    error.message
  );
  process.exit(1);
}

module.exports = { db };
