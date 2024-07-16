import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserEmpId = null;

document.addEventListener("DOMContentLoaded", (event) => {
  const urlParams = new URLSearchParams(window.location.search);
  const empId = urlParams.get('emp_id');
  if (!empId) {
    console.error('Employee ID not provided in URL');
    // Redirect or handle the error as needed
    window.location.href = "../error-page.html"; // Example of redirecting to an error page
    return;
  }

  // Set the currentUserEmpId
  currentUserEmpId = empId;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const emp_id = currentUserEmpId;
      const todayDate = new Date().toISOString().slice(0, 10);
      document.getElementById("today-date").innerText = formatDate(todayDate);

      fetchAttendance(emp_id, todayDate, "attendance-today");

      document.getElementById("submit-button").addEventListener("click", async () => {
        const selectedDate = document.getElementById("date-picker").value;
        document.getElementById("selected-date").innerText = formatDate(selectedDate);
        const attendanceDetails = await fetchAttendance(emp_id, selectedDate, "attendance-details", true);
        if (Array.isArray(attendanceDetails)) {
          populateAttendanceModal(attendanceDetails);
        } else {
          console.error("Failed to fetch attendance details or attendanceDetails is not an array.");
        }
      });

      document.getElementById("view-details-button").addEventListener("click", () => {
        const selectedDate = document.getElementById("selected-date").innerText;
        document.getElementById("modal-selected-date").innerText = selectedDate;
        $("#attendanceModal").modal("show");
      });

      // Set max attribute of date-picker to today's date
      document.getElementById("date-picker").max = todayDate;

      // Logout functionality
      document.getElementById("logout-button").addEventListener("click", async () => {
        try {
          await auth.signOut();
          window.location.href = "../login.html"; // Redirect to login page after logout
        } catch (error) {
          console.error("Error signing out:", error);
        }
      });
    } else {
      console.error("User is not authenticated.");
      window.location.href = "../login.html"; // Redirect to login page if user is not authenticated
    }
  });

  // Populate dropdowns
  populateDropdowns();
});

// Function to fetch attendance based on date and emp_id
async function fetchAttendance(emp_id, date, elementId, showTotal = false) {
  const todayDate = new Date().toISOString().slice(0, 10);
  if (date > todayDate) {
    console.error("Selected date cannot be in the future.");
    return;
  }

  const startOfWorkDay = new Date(`${date}T09:00:00`);
  const endOfWorkDay = new Date(`${date}T18:00:00`);

  console.log("Fetching attendance for date:", date);

  const q = query(
    collection(db, "in_out_details"),
    where("emp_id", "==", emp_id),
    where("timestamp", ">=", new Date(date)),
    where("timestamp", "<=", new Date(new Date(date).setHours(23, 59, 59, 999)))
  );

  const querySnapshot = await getDocs(q);

  console.log("Total records fetched:", querySnapshot.size);

  const attendance = document.getElementById(elementId);
  attendance.innerHTML = "";
  let totalMinutes = 0;
  const workIntervals = [];

  let currentInTime = null;
  let firstLoginTime = null;
  let lastLogoutTime = null;

  const attendanceDetails = [];

  querySnapshot.forEach((doc, index) => {
    const data = doc.data();
    const timestamp = data.timestamp.toDate();
    if (data.status === 1) {
      if (!firstLoginTime) {
        firstLoginTime = timestamp;
      }
      currentInTime = timestamp;
      attendanceDetails.push({ slNo: index + 1, inTime: timestamp });
    } else if (data.status === 2 && currentInTime) {
      workIntervals.push({ start: currentInTime, end: timestamp });
      totalMinutes += (timestamp - currentInTime) / (1000 * 60);
      currentInTime = null;
      lastLogoutTime = timestamp;
      attendanceDetails[attendanceDetails.length - 1].outTime = timestamp;
    }
  });

  console.log("Work intervals:", workIntervals);

  if (workIntervals.length === 0) {
    appendSlot(attendance, startOfWorkDay, endOfWorkDay, "red");
    document.getElementById("no-details-message").style.display = "block";
    return attendanceDetails;
  } else {
    document.getElementById("no-details-message").style.display = "none";
  }

  const combinedIntervals = [];
  workIntervals.sort((a, b) => a.start - b.start);

  let currentInterval = workIntervals[0];
  for (let i = 1; i < workIntervals.length; i++) {
    if (workIntervals[i].start <= currentInterval.end) {
      currentInterval.end = new Date(
        Math.max(currentInterval.end, workIntervals[i].end)
      );
    } else {
      combinedIntervals.push(currentInterval);
      currentInterval = workIntervals[i];
    }
  }
  combinedIntervals.push(currentInterval);

  console.log("Combined intervals:", combinedIntervals);

  let lastEnd = startOfWorkDay;
  combinedIntervals.forEach((interval) => {
    if (interval.start > lastEnd) {
      appendSlot(attendance, lastEnd, interval.start, "red");
    }
    appendSlot(attendance, interval.start, interval.end, "green");
    lastEnd = interval.end;
  });

  if (lastEnd < endOfWorkDay) {
    appendSlot(attendance, lastEnd, endOfWorkDay, "red");
  }

  if (showTotal) {
    const attendanceSpecificDateElement = document.getElementById("attendance-specific-date");
    if (attendanceSpecificDateElement) {
      attendanceSpecificDateElement.style.display = "block";
    }

    const totalHours = document.getElementById("total-hours");
    if (totalHours) {
      const roundedMinutes = Math.round(totalMinutes);
      totalHours.innerText = `Total working hours: ${Math.floor(
        roundedMinutes / 60
      )} hrs ${roundedMinutes % 60} mins`;
    }
  }

  // Display first login and last logout times
  const firstLoginDisplay = document.getElementById("first-login-time");
  const lastLogoutDisplay = document.getElementById("last-logout-time");
  if (firstLoginDisplay) {
    firstLoginDisplay.innerText = firstLoginTime ? `Login Time: ${formatTime(firstLoginTime)}` : "Login Time: N/A";
  }
  if (lastLogoutDisplay) {
    lastLogoutDisplay.innerText = lastLogoutTime ? `Logout Time: ${formatTime(lastLogoutTime)}` : "Logout Time: N/A";
  }

  return attendanceDetails;
}

// Function to append time slots to attendance bar
function appendSlot(parent, start, end, color) {
  const slotElement = document.createElement("div");
  slotElement.className = `slot ${color}`;
  const widthPercentage = ((end - start) / (9 * 60 * 60 * 1000)) * 100;
  slotElement.style.width = `${widthPercentage}%`;

  if (widthPercentage > 5) {
    slotElement.innerText = `${formatTime(start)} - ${formatTime(end)}`;
  }

  slotElement.setAttribute("data-time", `${formatTime(start)} - ${formatTime(end)}`);
  parent.appendChild(slotElement);

  setTimeout(() => {
    slotElement.classList.add("loaded");
  }, 100);
}

// Function to format time to HH:mm format
function formatTime(date) {
  return date.toTimeString().split(" ")[0].slice(0, 5);
}

// Function to format date to "Month Day, Year" format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Function to populate attendance modal with details
function populateAttendanceModal(attendanceDetails) {
  const tableBody = document.getElementById("attendance-details-table");
  tableBody.innerHTML = "";

  if (Array.isArray(attendanceDetails) && attendanceDetails.length > 0) {
    attendanceDetails.forEach(detail => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${detail.slNo}</td>
        <td>${formatTime(detail.inTime)}</td>
        <td>${formatTime(detail.outTime)}</td>
      `;
      tableBody.appendChild(row);
    });
  } else {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="3">No details available for selected date.</td>`;
    tableBody.appendChild(row);
  }
}

// Function to populate dropdowns with date values
function populateDropdowns() {
  const todayDate = new Date();
  const datePicker = document.getElementById("date-picker");
  datePicker.value = todayDate.toISOString().slice(0, 10);
}

// Logout button click listener
document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await auth.signOut();
    window.location.href = "../login.html"; // Redirect to login page after logout
  } catch (error) {
    console.error("Error signing out:", error);
  }
});
