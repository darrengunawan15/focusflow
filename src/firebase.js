// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzhQNJQLl8Mk8RV9ormg0PonuR1YRFrRM",
  authDomain: "focusflow-5f7ad.firebaseapp.com",
  projectId: "focusflow-5f7ad",
  storageBucket: "focusflow-5f7ad.firebasestorage.app",
  messagingSenderId: "102574767434",
  appId: "1:102574767434:web:7de5d1c1fc50ea8c6495b3",
  measurementId: "G-N0DBR4JX85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };