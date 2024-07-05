const firebaseConfig = {
    apiKey: "AIzaSyCK-0_dk_itH_zua9YvPJJsMybk8E6ie7k",
    authDomain: "logxp-c4773.firebaseapp.com",
    projectId: "logxp-c4773",
    storageBucket: "logxp-c4773.appspot.com",
    messagingSenderId: "750017382235",
    appId: "1:750017382235:web:8e99789517d50bebab7c7e",
    measurementId: "G-KHPJEV4QML"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  document.addEventListener('DOMContentLoaded', (event) => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
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
        window.location.href = '../login/traineelogin.html';
      }
    });
  
    // Load default content
    loadPage('daily');
  });
  
  const loadPage = (page) => {
    $('#content').load(`./pages/${page}.html`);
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
  