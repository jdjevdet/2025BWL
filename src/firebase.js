// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_rtbXYt-XyT2I6titIYQZxmHm-FLhWpI",
  authDomain: "livebwl.firebaseapp.com",
  projectId: "livebwl",
  storageBucket: "livebwl.firebasestorage.app", // ✅ updated to match your actual bucket
  messagingSenderId: "929219494191",
  appId: "1:929219494191:web:d18417a2d461f5a617e1da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);
