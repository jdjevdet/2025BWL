// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Import Firestore and Storage
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Note: getAnalytics is fine to keep, but not used by the App.jsx code
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFNIStQotTcGrmkyKnD-OT03D6xIbW3Wo",
  authDomain: "bwl2025-6ec5b.firebaseapp.com",
  projectId: "bwl2025-6ec5b",
  storageBucket: "bwl2025-6ec5b.appspot.com", // Corrected storage bucket URL
  messagingSenderId: "719174428341",
  appId: "1:719174428341:web:15e85cb53ee1b585ddc0fc",
  measurementId: "G-ZLMRVJ95ZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// --- ADD THESE LINES ---
// Initialize Firestore and Storage and export them
export const db = getFirestore(app);
export const storage = getStorage(app);