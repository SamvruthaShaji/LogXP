// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbS26iUhURdNCJQWvZSfLQW5XX6qVfj1w",
  authDomain: "logxp-f9b12.firebaseapp.com",
  projectId: "logxp-f9b12",
  storageBucket: "logxp-f9b12.appspot.com",
  messagingSenderId: "458817835971",
  appId: "1:458817835971:web:7ed4a7577d655796cf2376",
  measurementId: "G-J87HRDQ3F3",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        window.location.href = "../dashboard/pages/dailyattendance/daily.html"; // Redirect to dashboard
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
      });
  });
