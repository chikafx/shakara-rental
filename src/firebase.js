import { initializeApp } from "firebase/app";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";


import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { loadStripe } from '@stripe/stripe-js';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Google Maps configuration
const mapConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  libraries: ['places']
};


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: "G-KS9NT0Z058"
};



// Export Stripe and Maps functionality
export const initStripe = async () => {
  return await stripePromise;
};

export const initGoogleMaps = () => {
  return { GoogleMap, LoadScript, mapConfig };
};


// Initialize Firebase with error handling
let app, auth, db, storage;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

} catch (error) {
  console.error("Firebase initialization error:", error);
  throw new Error("Failed to initialize Firebase. Please check your configuration.");
}


// Export with null checks
// Google Sign-In function
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export { 
  auth, 
  db,
  storage,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithEmailAndPassword,
  signInWithGoogle
};
