import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCyT72jTkBqoCnLKHAQEKmc508LDMKHk7A",
  authDomain: "projectarx-b11bb.firebaseapp.com",
  projectId: "projectarx-b11bb",
  storageBucket: "projectarx-b11bb.firebasestorage.app",
  messagingSenderId: "1032852784768",
  appId: "1:1032852784768:web:5fc84c1a303e4144dbc865",
  measurementId: "G-7N9M8ZEWR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
