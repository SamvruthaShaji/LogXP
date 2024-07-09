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

document.addEventListener("DOMContentLoaded", () => {
  const monthSelect = document.getElementById("lop-month");
  const yearSelect = document.getElementById("lop-year");
  const calendarTitle = document.getElementById("lop-calendar-title");
  const calendarBody = document.querySelector("#lop-calendar tbody");
  const totalPaidDaysElem = document.querySelector(
    ".lop-summary p:nth-child(1)"
  );
  const fullLopDaysElem = document.querySelector(".lop-summary p:nth-child(2)");
  const halfLopDaysElem = document.querySelector(".lop-summary p:nth-child(3)");

  monthSelect.addEventListener("change", updateCalendar);
  yearSelect.addEventListener("change", updateCalendar);

  async function updateCalendar() {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);

    calendarTitle.textContent = `${monthSelect.options[month].text} ${year}`;
    await generateCalendar(month, year);
    updateSummary();
  }

  async function generateCalendar(month, year) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    let day = 1;
    let html = "";

    // Fetch leave details from Firebase
    const leaves = await getLeaveDetails(year, month);
    console.log("Leaves fetched from Firestore:", leaves);

    for (let i = 0; i < 6; i++) {
      let row = "<tr>";

      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < (startDay === 0 ? 6 : startDay - 1)) {
          row += "<td></td>";
        } else if (day > daysInMonth) {
          break;
        } else {
          const classes = [];
          if (j === 6) classes.push("lop-sunday");

          const leaveDetail = leaves.find((leave) => leave.day === day);
          if (leaveDetail) {
            console.log(`Processing day ${day}:`, leaveDetail);
            if (leaveDetail.remark === "Half_LOP") {
              console.log(`Adding 'lop-half-lop' class to day ${day}`);
              classes.push("lop-half-lop");
            }
            if (leaveDetail.remark === "LOP") {
              console.log(`Adding 'lop-full-lop' class to day ${day}`);
              classes.push("lop-full-lop");
            }
          }

          row += `<td class="${classes.join(" ")}">${day}</td>`;
          day++;
        }
      }

      row += "</tr>";
      html += row;

      if (day > daysInMonth) break;
    }

    calendarBody.innerHTML = html;
    updateSummary();
  }

  function updateSummary() {
    const cells = document.querySelectorAll("#lop-calendar tbody td");
    let totalDays = 0;
    let fullLopDays = 0;
    let halfLopDays = 0;

    cells.forEach((cell) => {
      if (cell.textContent !== "") {
        totalDays++;
      }
      if (cell.classList.contains("lop-full-lop")) {
        fullLopDays++;
      }
      if (cell.classList.contains("lop-half-lop")) {
        halfLopDays++;
      }
    });

    totalPaidDaysElem.textContent = `Total Paid Days: ${totalDays}`;
    fullLopDaysElem.textContent = `Full LOP Days: ${fullLopDays}`;
    halfLopDaysElem.textContent = `Half LOP Days: ${halfLopDays}`;
  }

  async function getLeaveDetails(year, month) {
    const leaveDetails = [];
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    const q = query(
      collection(db, "leave_details"),
      where("leave_date", ">=", start),
      where("leave_date", "<=", end),
      where("emp_id", "==", "emp105") // Filter by emp_id
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.leave_date.toDate();
      console.log("Fetched document:", data);
      leaveDetails.push({
        day: date.getDate(),
        remark: data.remark,
      });
    });

    return leaveDetails;
  }

  // Initialize the calendar with the current month and year
  const now = new Date();
  monthSelect.value = now.getMonth();
  yearSelect.value = now.getFullYear();
  updateCalendar();
});
