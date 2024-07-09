// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    db.collection("employee_details")
      .where("email", "==", email)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          alert("No user found with this email.");
          return;
        }
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.password === password) {
            window.location.href = "../dashboard/pages/dailyattendance/daily.html"; // Redirect to dashboard
          } else {
            alert("Incorrect password.");
          }
        });
      })
      .catch((error) => {
        console.error("Error during login: ", error);
      });
  });
