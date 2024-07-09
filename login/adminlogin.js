// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5tbpKUlx1BoJnxyHOibP7T_uymsYBXA0",
    authDomain: "logxp-31c62.firebaseapp.com",
    projectId: "logxp-31c62",
    storageBucket: "logxp-31c62.appspot.com",
    messagingSenderId: "17276012238",
    appId: "1:17276012238:web:464030eb3b2062bb55729f",
    measurementId: "G-FVZH4VFV6T"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    // Query the admin collection
    db.collection("admin")
      .where("admin_email", "==", email)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          alert("No admin found with this email.");
          return;
        }
        querySnapshot.forEach((doc) => {
          const adminData = doc.data();
          if (adminData.admin_password === password) {
            window.location.href = "../Admin/index.html"; 
          } else {
            alert("Incorrect password.");
          }
        });
      })
      .catch((error) => {
        console.error("Error during admin login: ", error);
      });
  });
  