
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from "firebase/auth"


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8VLPnq-0KlvTkjp8fTDLPsWxNxU-d-tk",
  authDomain: "aitravel-b81b6.firebaseapp.com",
  projectId: "aitravel-b81b6",
  storageBucket: "aitravel-b81b6.firebasestorage.app",
  messagingSenderId: "176854176841",
  appId: "1:176854176841:web:418a42f002646112869b98",
  measurementId: "G-4JJ6JSB55K"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);
