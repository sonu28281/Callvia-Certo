import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSfpVQkKoqRnp2iUFq3DCEIowt_0A2moQ",
  authDomain: "callvia-certo.firebaseapp.com",
  projectId: "callvia-certo",
  storageBucket: "callvia-certo.firebasestorage.app",
  messagingSenderId: "476552436876",
  appId: "1:476552436876:web:b4c4b93cc9573ac404afa9",
  measurementId: "G-5D5G9Y0B84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
