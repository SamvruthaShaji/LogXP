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

// Handle user authentication state
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
      // User is signed in, get user details from Firestore
      const email = user.email;
      db.collection('employee_details').where('email', '==', email).get()
          .then(querySnapshot => {
              if (!querySnapshot.empty) {
                  querySnapshot.forEach(doc => {
                      const employee = doc.data();
                      document.getElementById('greeting').innerText = `Hi ${employee.emp_name}`;
                      document.getElementById('profile-pic').src = employee.profile_pic;
                      document.getElementById('emp-name').innerText = employee.emp_name;
                      document.getElementById('emp-id').innerText = `Trainee ID: ${employee.emp_id}`;
                      document.getElementById('emp-rank').innerText = `Trainee Rank: ${employee.attendance_ranking}`;
                      document.getElementById('total-attendance').innerText = `Total Attendance: ${employee.total_attendance} days`;

                      // Assuming you have calculated these values before
                      const totalDays = 120; // Example value
                      const presentDays = 99; // Example value
                      const absentDays = 21; // Example value
                      const overallPercentage = ((presentDays / totalDays) * 100).toFixed(1);

                      document.getElementById('totalDays').innerText = totalDays;
                      document.getElementById('presentDays').innerText = presentDays;
                      document.getElementById('absentDays').innerText = absentDays;
                      document.getElementById('overallPercentage').innerText = overallPercentage;
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

// Initialize Charts
const attendanceChartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [{
      label: 'Attendance',
      data: [90, 70, 95, 90, 80, 80],
      backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(54, 162, 235, 0.2)'
      ],
      borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)'
      ],
      borderWidth: 1
  },
  {
      label: 'Absent',
      data: [10, 30, 5, 10, 20, 20],
      backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 99, 132, 0.2)'
      ],
      borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
  }]
};
const attendanceChartConfig = {
  type: 'bar',
  data: attendanceChartData,
  options: {
      scales: {
          y: {
              beginAtZero: true
          }
      }
  }
};

const attendancePieChartData = {
  labels: ['Present', 'Absent'],
  datasets: [{
      label: 'Attendance',
      data: [99, 21],
      backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)'
      ],
      borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
  }]
};
const attendancePieChartConfig = {
  type: 'doughnut',
  data: attendancePieChartData,
  options: {}
};

// Create Chart.js instances
const attendanceChartCanvas = document.getElementById('attendanceChart');
const attendanceChart = new Chart(attendanceChartCanvas, attendanceChartConfig);

const attendancePieChartCanvas = document.getElementById('attendancePieChart');
const attendancePieChart = new Chart(attendancePieChartCanvas, attendancePieChartConfig);

// Log out button handler
document.getElementById('logout').addEventListener('click', () => {
  firebase.auth().signOut().then(() => {
      window.location.href = 'login.html';
  }).catch((error) => {
      console.error('Error signing out: ', error);
  });
});
