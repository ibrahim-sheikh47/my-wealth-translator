// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyD2TON7J3pRfPnsZJPxGIlZABVwDWdYoXw",
  authDomain: "my-wealth-translator.firebaseapp.com",
  projectId: "my-wealth-translator",
  storageBucket: "my-wealth-translator.firebasestorage.app",
  messagingSenderId: "286334709738",
  appId: "1:286334709738:web:c72cc43638046f95764c93",
  measurementId: "G-C0136572FK",
};

// Prevent re-initialization on hot reload
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
