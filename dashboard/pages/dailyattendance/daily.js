import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
 
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbS26iUhURdNCJQWvZSfLQW5XX6qVfj1w",
  authDomain: "logxp-f9b12.firebaseapp.com",
  projectId: "logxp-f9b12",
  storageBucket: "logxp-f9b12.appspot.com",
  messagingSenderId: "458817835971",
  appId: "1:458817835971:web:7ed4a7577d655796cf2376",
  measurementId: "G-J87HRDQ3F3"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
 
// Function to fetch attendance based on date
async function fetchAttendance(date, elementId, showTotal = false) {
  const startOfWorkDay = new Date(`${date}T09:00:00`);
  const endOfWorkDay = new Date(`${date}T18:00:00`);
 
  console.log("Fetching attendance for date:", date);
 
  const q = query(
    collection(db, "in_out_details"),
    where("emp_id", "==", "emp616"),
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
 
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const timestamp = data.timestamp.toDate();
    if (data.status === 1) {
      if (!firstLoginTime) {
        firstLoginTime = timestamp;
      }
      currentInTime = timestamp;
    } else if (data.status === 2 && currentInTime) {
      workIntervals.push({ start: currentInTime, end: timestamp });
      totalMinutes += (timestamp - currentInTime) / (1000 * 60);
      currentInTime = null;
      lastLogoutTime = timestamp;
    }
  });
 
  console.log("Work intervals:", workIntervals);
 
  if (workIntervals.length === 0) {
    appendSlot(attendance, startOfWorkDay, endOfWorkDay, "red");
    return;
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
    document.getElementById("attendance-specific-date").style.display = "block";
    const totalHours = document.getElementById("total-hours");
    const roundedMinutes = Math.round(totalMinutes);
    totalHours.innerText = `Total working hours: ${Math.floor(
      roundedMinutes / 60
    )} hrs ${roundedMinutes % 60} mins`;
  }
 
  // Display first login and last logout times
  const firstLoginDisplay = document.getElementById("first-login-time");
  const lastLogoutDisplay = document.getElementById("last-logout-time");
  if (firstLoginTime) {
    firstLoginDisplay.innerText = `Login Time: ${formatTime(firstLoginTime)}`;
  } else {
    firstLoginDisplay.innerText = "Login Time: N/A";
  }
  if (lastLogoutTime) {
    lastLogoutDisplay.innerText = `Logout Time: ${formatTime(lastLogoutTime)}`;
  } else {
    lastLogoutDisplay.innerText = "Logout Time: N/A";
  }
}
 
// Function to append time slots to attendance bar
function appendSlot(parent, start, end, color) {
  const slotElement = document.createElement("div");
  slotElement.className = `slot ${color}`;
  const widthPercentage = ((end - start) / (9 * 60 * 60 * 1000)) * 100;
  slotElement.style.width = `${widthPercentage}%`;
 
  // Only show the time label if the width is more than 5%
  if (widthPercentage > 5) {
    slotElement.innerText = `${formatTime(start)} - ${formatTime(end)}`;
  }
 
  slotElement.setAttribute(
    "data-time",
    `${formatTime(start)} - ${formatTime(end)}`
  );
  parent.appendChild(slotElement);
 
  // Trigger animation by adding a class with a slight delay
  setTimeout(() => {
    slotElement.classList.add("loaded");
  }, 100);
}
 
// Function to format time to HH:mm format
function formatTime(date) {
  return date.toTimeString().split(" ")[0].slice(0, 5);
}
 
// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const todayDate = new Date().toISOString().slice(0, 10);
  document.getElementById("today-date").innerText = todayDate;
 
  // Fetch today's attendance
  fetchAttendance(todayDate, "attendance-today");
 
  // Event listener for submit button
  document.getElementById("submit-button").addEventListener("click", () => {
    const selectedDate = document.getElementById("date-picker").value;
    document.getElementById("selected-date").innerText = selectedDate;
    fetchAttendance(selectedDate, "attendance-details", true);
  });
});