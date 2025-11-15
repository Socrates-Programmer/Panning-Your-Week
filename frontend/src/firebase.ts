import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace these values with your Firebase project credentials from Google Console
// Instructions:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new Firebase project (or use existing)
// 3. Enable Google Sign-In in Authentication > Sign-in method
// 4. Create a Firestore Database (production mode, location: us-central1)
// 5. Copy these values from Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyBBBjma7mLreK6VV8Jmhdkva9H0nOvnqFg",
  authDomain: "planning-your-week.firebaseapp.com",
  projectId: "planning-your-week",
  storageBucket: "planning-your-week.firebasestorage.app",
  messagingSenderId: "156487496848",
  appId: "1:156487496848:web:f850aa0d889a04e17b5415",
  measurementId: "G-QC343ZPZKP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore Database
export const db = getFirestore(app);
