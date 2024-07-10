// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA5tbpKUlx1BoJnxyHOibP7T_uymsYBXA0",
  authDomain: "logxp-31c62.firebaseapp.com",
  projectId: "logxp-31c62",
  storageBucket: "logxp-31c62.appspot.com",
  messagingSenderId: "17276012238",
  appId: "1:17276012238:web:464030eb3b2062bb55729f",
  measurementId: "G-FVZH4VFV6T",
};

// Check if Firebase has already been initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

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
              // Fetch attendance data once emp_id is set
              const currentMonth = new Date().getMonth() + 1;
              const currentYear = new Date().getFullYear();
              generateCalendar(currentMonth, currentYear);
              fetchAttendanceData(currentMonth, currentYear);
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

  // Populate dropdowns
  populateDropdowns();
});

// DOM elements
const monthSelect = document.getElementById("month");
const yearSelect = document.getElementById("year");
const calendarTitle = document.getElementById("calendar-title");
const totalWorkingDays = document.getElementById("total-working-days");
const totalPresentDays = document.getElementById("total-present-days");
const totalFullLeaves = document.getElementById("total-full-leaves");
const totalHalfLeaves = document.getElementById("total-half-leaves");
const calendarBody = document.querySelector(".calendar tbody");

// Populate options for month and year dropdowns
function populateDropdowns() {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();

  // Populate months
  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index + 1;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  // Populate years from 2000 to current year
  for (let year = 2000; year <= currentYear; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  // Set current month and year as selected
  monthSelect.value = new Date().getMonth() + 1;
  yearSelect.value = new Date().getFullYear();
}

// Calculate total working days excluding weekends
function calculateTotalWorkingDays(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }

  return workingDays;
}

// Generate calendar for a given month and year
function generateCalendar(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0 (Sunday) to 6 (Saturday)
  
  calendarTitle.textContent = `${monthSelect.options[month - 1].textContent} ${year}`;
  calendarBody.innerHTML = "";

  let date = 1;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        const cell = document.createElement("td");
        row.appendChild(cell);
      } else if (date > daysInMonth) {
        break;
      } else {
        const cell = document.createElement("td");
        cell.textContent = date;
        row.appendChild(cell);
        date++;
      }
    }

    calendarBody.appendChild(row);
  }
}

// Fetch attendance data and update calendar and summary
function fetchAttendanceData(month, year) {
  if (!currentUserEmpId) {
    console.log("Current user ID is not set.");
    return;
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Clear previous data
  totalWorkingDays.textContent = calculateTotalWorkingDays(month, year);
  totalPresentDays.textContent = "0";
  totalFullLeaves.textContent = "0";
  totalHalfLeaves.textContent = "0";

  // Fetch data from Firestore
  db.collection("attendance_register")
    .where("emp_id", "==", currentUserEmpId)
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const day = data.date.toDate().getDate();
        const status = data.attendance_status;

        // Update calendar day color based on status
        const cells = calendarBody.querySelectorAll("td");
        cells.forEach((cell) => {
          if (parseInt(cell.textContent) === day) {
            if (status === 'p') {
              cell.classList.add("working-day");
            } else if (status === 'h') {
              cell.classList.add("partial-leave");
            } else if (status === 'a') {
              cell.classList.add("full-leave");
            }
          }
        });

        // Update summary counts
        if (status === 'p') {
          totalPresentDays.textContent = String(parseInt(totalPresentDays.textContent) + 1);
        } else if (status === 'h') {
          totalHalfLeaves.textContent = String(parseInt(totalHalfLeaves.textContent) + 1);
        } else if (status === 'a') {
          totalFullLeaves.textContent = String(parseInt(totalFullLeaves.textContent) + 1);
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching attendance data: ", error);
    });
}

// Event listeners
monthSelect.addEventListener("change", () => {
  const selectedMonth = parseInt(monthSelect.value);
  const selectedYear = parseInt(yearSelect.value);
  generateCalendar(selectedMonth, selectedYear);
  fetchAttendanceData(selectedMonth, selectedYear);
});

yearSelect.addEventListener("change", () => {
  const selectedMonth = parseInt(monthSelect.value);
  const selectedYear = parseInt(yearSelect.value);
  generateCalendar(selectedMonth, selectedYear);
  fetchAttendanceData(selectedMonth, selectedYear);
});
