// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5tbpKUlx1BoJnxyHOibP7T_uymsYBXA0",
  authDomain: "logxp-31c62.firebaseapp.com",
  projectId: "logxp-31c62",
  storageBucket: "logxp-31c62.appspot.com",
  messagingSenderId: "17276012238",
  appId: "1:17276012238:web:464030eb3b2062bb55729f",
  measurementId: "G-FVZH4VFV6T",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    // Check if email is in admin collection
    db.collection("admin")
      .where("admin_email", "==", email)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Email found in admin collection, proceed with sign-in
          auth
            .signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
              // Signed in
              var user = userCredential.user;
              window.location.href = "../Admin/batchselect/batch.html";
            })
            .catch((error) => {
              var errorCode = error.code;
              var errorMessage = error.message;
              alert(errorMessage);
            });
        } else {
          // Email not found in admin collection
          alert("No admin found with this email.");
        }
      })
      .catch((error) => {
        console.error("Error checking admin collection: ", error);
        alert("Error checking admin collection.");
      });
  });
