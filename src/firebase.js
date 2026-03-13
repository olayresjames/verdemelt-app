import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigValid = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
].every((key) => {
  const value = firebaseConfig[key];
  return typeof value === 'string' && value.trim() !== '' && value.trim().toLowerCase() !== 'undefined';
});

if (!isFirebaseConfigValid) {
  console.warn(
    'Missing or invalid Firebase config. Make sure VITE_FIREBASE_* environment variables are set (e.g., in .env or your deployment platform).'
  );
}

let app;
let db;
if (isFirebaseConfigValid) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { db, isFirebaseConfigValid };