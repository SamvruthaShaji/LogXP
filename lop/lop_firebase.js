// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5S5o_B01gt0L5Vy7kb23nsjC2t4RFJ0A",
  authDomain: "logxp-dec0f.firebaseapp.com",
  projectId: "logxp-dec0f",
  storageBucket: "logxp-dec0f.appspot.com",
  messagingSenderId: "784967106288",
  appId: "1:784967106288:web:8ced91c5752fa0e9b44c35",
  measurementId: "G-BCXNYKRPCC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
