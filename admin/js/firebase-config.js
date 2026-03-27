import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase configuration from .env (hardcoded for simplicity in local opening)
const firebaseConfig = {
  apiKey: "AIzaSyBzsDW33HffRMm3OiNCVG1Z2E8FcCPqffE",
  authDomain: "resumate-c9968.firebaseapp.com",
  projectId: "resumate-c9968",
  storageBucket: "resumate-c9968.firebasestorage.app",
  messagingSenderId: "830045302104",
  appId: "1:830045302104:web:5c04fd7a7ad06fee56892d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, signInAnonymously };
