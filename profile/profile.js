// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      const email = user.email;

      try {
        const employeeSnapshot = await db
          .collection("employee_details")
          .where("email", "==", email)
          .get();

        if (!employeeSnapshot.empty) {
          const employee = employeeSnapshot.docs[0].data();
          const empId = employee.emp_id;

          document.getElementById("profile-pic-large").src = employee.profile_pic;
          document.getElementById("emp_name").innerText = employee.emp_name;
          document.getElementById("emp-id").innerText = empId;
          document.getElementById("Batch").innerText = employee.Batch;
          document.getElementById("email").innerText = email;

          const attendanceSnapshot = await db
            .collection("attendance_register")
            .where("emp_id", "==", empId)
            .get();

          const totalAttendance = attendanceSnapshot.size;

          const attendanceData = attendanceSnapshot.docs.map(doc => doc.data().attendance_status);

          const presentDays = attendanceData.filter(status => status === 'p').length;
          const absentDays = attendanceData.filter(status => status === 'a').length;
          const halfDays = attendanceData.filter(status => status === 'h').length;

          // Pie chart for attendance
          const pieCtx = document.getElementById('attendance-pie-chart').getContext('2d');
          new Chart(pieCtx, {
            type: 'pie',
            data: {
              labels: ['Present', 'Absent', 'Half Day'],
              datasets: [{
                data: [presentDays, absentDays, halfDays],
                backgroundColor: ['#DEF9DC', '#FFE0E0', '#FFFDD1']
              }]
            },
            options: {
              title: {
                display: true,
                text: 'Attendance Distribution'
              }
            }
          });

          // Bar chart for monthly absences
          const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];

          const monthlyAbsences = months.map(month => {
            return attendanceSnapshot.docs.filter(doc =>
              doc.data().attendance_status === 'a' && doc.data().month === month).length;
          });

          const barCtx = document.getElementById('attendance-bar-chart').getContext('2d');
          new Chart(barCtx, {
            type: 'bar',
            data: {
              labels: months,
              datasets: [{
                label: 'Absences',
                data: monthlyAbsences,
                backgroundColor: ''
              }]
            },
            options: {
              title: {
                display: true,
                text: 'Monthly Absences'
              },
              scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
                }]
              }
            }
          });
        } else {
          console.log("No matching documents.");
        }
      } catch (error) {
        console.log("Error getting documents: ", error);
      }
    }
  });
});
