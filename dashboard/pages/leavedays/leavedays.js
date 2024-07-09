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
  measurementId: "G-J87HRDQ3F3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function () {
  const monthSelect = document.getElementById("month");
  const yearSelect = document.getElementById("year");
  const calendarTitle = document.getElementById("calendar-title");
  const calendarBody = document.querySelector(".calendar tbody");

  const totalWorkingDaysElement = document.getElementById("total-working-days");
  const totalFullLeavesElement = document.getElementById("total-full-leaves");
  const totalHalfLeavesElement = document.getElementById("total-half-leaves");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Current month (1-12)
  const currentYear = currentDate.getFullYear();

  // Populate month dropdown options up to the current month
  months.forEach((month, index) => {
    if (index + 1 <= currentMonth) {
      const option = document.createElement("option");
      option.text = month;
      option.value = index + 1; // Store month as a number (1-12)
      monthSelect.add(option);
    }
  });

  // Populate year dropdown options up to the current year
  for (let year = currentYear - 4; year <= currentYear; year++) {
    const option = document.createElement("option");
    option.text = year;
    option.value = year;
    yearSelect.add(option);
  }

  // Event listeners for month and year dropdowns
  monthSelect.addEventListener("change", updateCalendar);
  yearSelect.addEventListener("change", updateCalendar);

  // Function to update calendar display when month or year changes
  async function updateCalendar() {
    const month = monthSelect.value;
    const year = yearSelect.value;
    if (month && year) {
      calendarTitle.textContent = `${months[month - 1]} ${year}`;
      const leaveData = await fetchLeaveDetails(month, year);
      updateCalendarDisplay(leaveData, month, year);
    }
  }

  // Function to fetch leave details for the selected month and year from Firestore
  async function fetchLeaveDetails(month, year) {
    const leaveDetailsRef = collection(db, "leave_details");
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Query to fetch leave details within the specified month and year
    const q = query(
      leaveDetailsRef,
      where("leave_date", ">=", startDate),
      where("leave_date", "<=", endDate),
      where("emp_id", "==", "emp106") // Replace with your employee ID variable or input
    );

    const querySnapshot = await getDocs(q);

    const leaveData = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let remark = data.remark;

      // Map "leave" and "LOP" to "full-leave", "half-leave" and "Half_LOP" to "partial-leave"
      if (remark === "leave" || remark === "LOP") {
        remark = "full-leave";
      } else if (remark === "half-leave" || remark === "Half_LOP") {
        remark = "partial-leave";
      }

      leaveData.push({
        leave_date: data.leave_date,
        remark: remark,
      });
    });

    return leaveData;
  }

  function updateCalendarDisplay(leaveData, month, year) {
    calendarBody.innerHTML = "";

    // Adjust first day to start from Monday
    let firstDay = new Date(year, month - 1, 1).getDay();
    firstDay = (firstDay + 6) % 7; // Make Monday the first day of the week

    const daysInMonth = new Date(year, month, 0).getDate();
    let date = 1;

    // Create initial row with empty cells for days before the first of the month
    let row = document.createElement("tr");
    for (let i = 0; i < firstDay; i++) {
      const cell = document.createElement("td");
      cell.classList.add("empty");
      row.appendChild(cell);
    }

    // Add remaining days of the month
    while (date <= daysInMonth) {
      let dayOfWeek = (firstDay + date - 1) % 7;
      if (dayOfWeek === 0) {
        row = document.createElement("tr"); // Start a new row for each new week
      }

      const cell = document.createElement("td");
      cell.textContent = date;

      // Determine class based on leave information
      const leaveInfo = leaveData.find((leave) => {
        const leaveDate = new Date(leave.leave_date.toDate());
        return leaveDate.getDate() === date;
      });

      if (dayOfWeek === 6) {
        // Sunday
        cell.classList.add("sunday");
      } else if (leaveInfo) {
        if (leaveInfo.remark === "partial-leave") {
          cell.classList.add("partial-leave");
        } else {
          // Assuming both partial-leave and absent are treated the same way
          cell.classList.add("full-leave");
        }
      } else if (
        year == currentYear &&
        month == currentMonth &&
        date > currentDate.getDate()
      ) {
        cell.classList.add("sunday"); // Future dates in the current month
      } else {
        cell.classList.add("working-day");
      }

      row.appendChild(cell);

      // Move to the next day
      date++;

      // Append the row when we reach the end of the week or month
      if (dayOfWeek === 6 || date > daysInMonth) {
        calendarBody.appendChild(row);
      }
    }

    // Update summary section
    const totalWorkingDays = daysInMonth - leaveData.length;
    const totalFullLeaves = leaveData.filter(
      (leave) => leave.remark === "full-leave"
    ).length;
    const totalHalfLeaves = leaveData.filter(
      (leave) => leave.remark === "partial-leave"
    ).length;

    totalWorkingDaysElement.textContent = totalWorkingDays;
    totalFullLeavesElement.textContent = totalFullLeaves;
    totalHalfLeavesElement.textContent = totalHalfLeaves;
  }

  // Initial calendar update with current month and year
  monthSelect.value = currentMonth;
  yearSelect.value = currentYear;
  updateCalendar();
});
