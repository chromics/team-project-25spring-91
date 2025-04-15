// // backend/src/config/firebase.js
// const admin = require('firebase-admin');
// const path = require('path');
// const fs = require('fs');

// try {
//   const serviceAccountPath = path.resolve(__dirname, '../../adminKey.json');
  
//   if (!fs.existsSync(serviceAccountPath)) {
//     throw new Error(`Service account file not found at: ${serviceAccountPath}`);
//   }

//   const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
//   // Log project details (safe to log)
//   console.log('Initializing Firebase Admin with:', {
//     projectId: serviceAccount.project_id,
//     clientEmail: serviceAccount.client_email
//   });

//   // Check if Firebase Admin is already initialized
//   if (!admin.apps.length) {
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount)
//     });
//     console.log('Firebase Admin initialized successfully');
//   }

// } catch (error) {
//   console.error('Firebase Admin initialization error:', error);
//   process.exit(1);
// }

// module.exports = admin; 