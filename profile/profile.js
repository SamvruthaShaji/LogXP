const firebaseConfig = {
  apiKey: "AIzaSyDbS26iUhURdNCJQWvZSfLQW5XX6qVfj1w",
  authDomain: "logxp-f9b12.firebaseapp.com",
  projectId: "logxp-f9b12",
  storageBucket: "logxp-f9b12.appspot.com",
  messagingSenderId: "458817835971",
  appId: "1:458817835971:web:7ed4a7577d655796cf2376",
  measurementId: "G-J87HRDQ3F3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", (event) => {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      const email = user.email;
      try {
        const employeeSnapshot = await db.collection("employee_details").where("email", "==", email).get();
        if (!employeeSnapshot.empty) {
          const employee = employeeSnapshot.docs[0].data();
          const empId = employee.emp_id;

          document.getElementById("profile-pic-large").src = employee.profile_pic;
          document.getElementById("emp-name").innerText = employee.emp_name;
          document.getElementById("emp-id").innerText = empId;

          const attendanceSnapshot = await db.collection("attendance_register").where("emp_id", "==", empId).get();
          const totalAttendance = attendanceSnapshot.size;
          document.getElementById("total-attendance").innerText = totalAttendance;

          const rankingSnapshot = await db.collection("attendance_ranking").where("emp_id", "==", empId).get();
          const totalPoints = rankingSnapshot.docs.reduce((sum, doc) => sum + doc.data().total_points, 0);
          document.getElementById("total-points").innerText = totalPoints;
        } else {
          console.log("No matching documents.");
        }
      } catch (error) {
        console.log("Error getting documents: ", error);
      }
    } else {
      window.location.href = "../../../login/traineelogin.html";
    }
  });
});
