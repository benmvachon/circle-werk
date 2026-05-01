import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwKkMvGtk70To4blaKygL-jw7EWCKGpDk",
  authDomain: "circle-work-e855b.firebaseapp.com",
  projectId: "circle-work-e855b",
  storageBucket: "circle-work-e855b.firebasestorage.app",
  messagingSenderId: "85758801896",
  appId: "1:85758801896:web:6c1e6bdbe66007c98d565d",
  measurementId: "G-4JYKT9CLXQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
