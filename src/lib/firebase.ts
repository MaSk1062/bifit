import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
// You can either use environment variables or replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyCYWJYpby44A4prr82rRtTIoXTDrgOz4e4",
  authDomain: "bifyt-f27b1.firebaseapp.com",
  projectId: "bifyt-f27b1",
  storageBucket: "bifyt-f27b1.firebasestorage.app",
  messagingSenderId: "714118611053",
  appId: "1:714118611053:web:c67b2aca6d204afe903f64"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only if supported)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

// Firebase configuration object for reference
export const firebaseConfigExport = firebaseConfig;

// Default export
export default app; 