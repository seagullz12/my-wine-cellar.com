// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZ8dXxRbwIDOkMpcuzEMYKifi20TxJlew",
  authDomain: "dbt-bigquery-setup-416318.firebaseapp.com",
  projectId: "dbt-bigquery-setup-416318",
  storageBucket: "dbt-bigquery-setup-416318.appspot.com",
  messagingSenderId: "44824993784",
  appId: "1:44824993784:web:2afc1837603317f51e800d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, signInWithEmailAndPassword, onAuthStateChanged, db };