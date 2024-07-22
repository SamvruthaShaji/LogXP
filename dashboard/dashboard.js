const firebaseConfig = {
  apiKey: "AIzaSyA5tbpKUlx1BoJnxyHOibP7T_uymsYBXA0",
  authDomain: "logxp-31c62.firebaseapp.com",
  projectId: "logxp-31c62",
  storageBucket: "logxp-31c62.appspot.com",
  messagingSenderId: "17276012238",
  appId: "1:17276012238:web:464030eb3b2062bb55729f",
  measurementId: "G-FVZH4VFV6T",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentUserEmpId = null;

document.addEventListener("DOMContentLoaded", (event) => {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      const email = user.email;
      db.collection("employee_details")
        .where("email", "==", email)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const employee = doc.data();
              currentUserEmpId = employee.emp_id;
              document.getElementById("profile-pic").src = employee.profile_pic;
              document.getElementById("profile-name").innerText = `Hi ${employee.emp_name}`;
            });
          } else {
            console.log("No matching documents.");
          }
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    } else {
      window.location.href = "../login/traineelogin.html";
    }
  });
});

// Add event listener to profile picture
document.getElementById("profile-pic").addEventListener("click", () => {
  window.location.href = "../../../profile/profile.html";
});
