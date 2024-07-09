// dashboard.js
const firebaseConfig = {
  apiKey: "AIzaSyDbS26iUhURdNCJQWvZSfLQW5XX6qVfj1w",
  authDomain: "logxp-f9b12.firebaseapp.com",
  projectId: "logxp-f9b12",
  storageBucket: "logxp-f9b12.appspot.com",
  messagingSenderId: "458817835971",
  appId: "1:458817835971:web:7ed4a7577d655796cf2376",
  measurementId: "G-J87HRDQ3F3",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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
              document.getElementById("profile-pic").src = employee.profile_pic;
              document.getElementById(
                "profile-name"
              ).innerText = `Hi ${employee.emp_name}`;
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

  // Load default content
  loadPage("daily");
});

const loadPage = (page) => {
  $("#content").load(`./pages/${page}.html`);
};

const toggleBtn = document.getElementById("toggle-btn");
const sidebar = document.querySelector(".sidebar");
const links = document.querySelectorAll(".nav-link");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const target = link.getAttribute("data-target");
    loadPage(target);

    links.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

// Add event listener to profile picture
document.getElementById("profile-pic").addEventListener("click", () => {
  window.location.href = "../../../profile/profile.html";
});
