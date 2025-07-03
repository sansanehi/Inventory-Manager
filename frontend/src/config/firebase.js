import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate Firebase configuration
const validateConfig = (config) => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration:', missingFields);
    throw new Error(`Missing required Firebase configuration: ${missingFields.join(', ')}`);
  }
};

let app;
let auth;
let googleProvider;
let db;

try {
  validateConfig(firebaseConfig);
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // You might want to show a user-friendly error message here
  throw error;
}

export { auth, googleProvider, db }; 