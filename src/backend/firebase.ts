// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8LK7Ah06VuXEEsKmDDzuNp3IMBfbpoEM",
  authDomain: "guesspkmn.firebaseapp.com",
  projectId: "guesspkmn",
  storageBucket: "guesspkmn.firebasestorage.app",
  messagingSenderId: "458192411709",
  appId: "1:458192411709:web:f33261269f5381256bde54",
  measurementId: "G-FH2634EZRY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Persist auth state in localStorage so users remain signed in across refreshes/close-reopen
setPersistence(auth, browserLocalPersistence).catch((e) => {
  console.warn('Unable to set auth persistence:', e);
});
const db = getFirestore(app);

export { auth, app, db };