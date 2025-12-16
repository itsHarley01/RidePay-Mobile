import { initializeApp } from "firebase/app";
import { Database, getDatabase } from "firebase/database";

// Firebase config pulled from Vite env vars
const firebaseConfig = {
  apiKey: "AIzaSyAcuot6bk3kWVhCkewVBTyOS64X3OBNkfY",
  authDomain: "acnpgs-44ff9.firebaseapp.com",
  databaseURL: "https://acnpgs-44ff9-default-rtdb.firebaseio.com",
  projectId: "acnpgs-44ff9",
  storageBucket: "acnpgs-44ff9.appspot.com",
  messagingSenderId: "465278396643",
  appId: "1:465278396643:web:c647e9d4f2e637d3fbfdd6",
  measurementId: "G-DV3YXR66BS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export a typed database instance
export const db: Database = getDatabase(app);
