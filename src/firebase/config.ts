import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCr4_cz1GjGjwgj7YyV9r6i5-bWDZPbLjw",
  authDomain: "brebuilds.firebaseapp.com",
  projectId: "brebuilds",
  storageBucket: "brebuilds.firebasestorage.app",
  messagingSenderId: "733031598130",
  appId: "1:733031598130:web:28decc89f0c2a322d4542b",
  measurementId: "G-CF2NMXDCRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
