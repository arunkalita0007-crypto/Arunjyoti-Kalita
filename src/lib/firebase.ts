import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAj2rwkO17gd5iDRgMJdSI-8ePLyWZBs2Y",
  authDomain: "aura-cinetrack.firebaseapp.com",
  projectId: "aura-cinetrack",
  storageBucket: "aura-cinetrack.firebasestorage.app",
  messagingSenderId: "284160556535",
  appId: "1:284160556535:web:d14aceb5dbd38354e142f2",
  measurementId: "G-Y46DV2HZ7Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
