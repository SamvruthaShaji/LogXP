// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCK-0_dk_itH_zua9YvPJJsMybk8E6ie7k",
    authDomain: "logxp-c4773.firebaseapp.com",
    projectId: "logxp-c4773",
    storageBucket: "logxp-c4773.appspot.com",
    messagingSenderId: "750017382235",
    appId: "1:750017382235:web:8e99789517d50bebab7c7e",
    measurementId: "G-KHPJEV4QML"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', (event) => {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, get user details from Firestore
            const email = user.email;
            db.collection('employee_details').where('email', '==', email).get()
                .then(querySnapshot => {
                    if (!querySnapshot.empty) {
                        querySnapshot.forEach(doc => {
                            const employee = doc.data();
                            document.getElementById('profile-pic').src = employee.profile_pic;
                            document.getElementById('profile-name').innerText = `Hi ${employee.emp_name}`;
                        });
                    } else {
                        console.log('No matching documents.');
                    }
                })
                .catch(error => {
                    console.log('Error getting documents: ', error);
                });
        } else {
            // No user is signed in
            window.location.href = 'login.html'; // Redirect to login if not authenticated
        }
    });
});

// Toggle sidebar
const toggleBtn = document.getElementById("toggle-btn");
const sidebar = document.querySelector(".sidebar");
const links = document.querySelectorAll(".nav-link");
const containers = document.querySelectorAll(".content > div");

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
});

links.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const target = link.getAttribute("data-target");

        containers.forEach((container) => {
            if (container.classList.contains(target)) {
                container.style.display = "block";
            } else {
                container.style.display = "none";
            }
        });

        links.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
    });
});

document.querySelector(".nav-link.active").click();
