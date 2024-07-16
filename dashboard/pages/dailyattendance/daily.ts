import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

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

interface EmployeeDetails {
  email: string;
  emp_id: string;
}

interface InOutDetails {
  emp_id: string;
  timestamp: {
    toDate: () => Date;
  };
  status: number;
}

interface WorkInterval {
  start: Date;
  end: Date;
}

interface AttendanceDetail {
  slNo: number;
  inTime?: Date;
  outTime?: Date;
}

async function fetchEmployeeIdByEmail(email: string): Promise<string | null> {
  const q = query(collection(db, "employee_details"), where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.error("No employee found with email:", email);
    return null;
  } else {
    const employeeDoc = querySnapshot.docs[0];
    return (employeeDoc.data() as EmployeeDetails).emp_id;
  }
}

async function fetchAttendance(emp_id: string, date: string, elementId: string, showTotal = false): Promise<AttendanceDetail[]> {
  const todayDate = new Date().toISOString().slice(0, 10);
  if (date > todayDate) {
    console.error("Selected date cannot be in the future.");
    return [];
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

  const attendance = document.getElementById(elementId) as HTMLElement;
  attendance.innerHTML = "";
  let totalMinutes = 0;
  const workIntervals: WorkInterval[] = [];

  let currentInTime: Date | null = null;
  let firstLoginTime: Date | null = null;
  let lastLogoutTime: Date | null = null;

  const attendanceDetails: AttendanceDetail[] = [];

  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data() as InOutDetails;
    const timestamp = data.timestamp.toDate();
    if (data.status === 1) {
      if (!firstLoginTime) {
        firstLoginTime = timestamp;
      }
      currentInTime = timestamp;
      attendanceDetails.push({ slNo: + 1, inTime: timestamp });
    } else if (data.status === 2 && currentInTime) {
      workIntervals.push({ start: currentInTime, end: timestamp });
      totalMinutes += (timestamp.getTime() - currentInTime.getTime()) / (1000 * 60);
      currentInTime = null;
      lastLogoutTime = timestamp;
      attendanceDetails[attendanceDetails.length - 1].outTime = timestamp;
    }
  });
  

  console.log("Work intervals:", workIntervals);

  if (workIntervals.length === 0) {
    appendSlot(attendance, startOfWorkDay, endOfWorkDay, "red");
    const noDetailsMessage = document.getElementById("no-details-message") as HTMLElement;
    noDetailsMessage.style.display = "block";
    return attendanceDetails;
  } else {
    const noDetailsMessage = document.getElementById("no-details-message") as HTMLElement;
    noDetailsMessage.style.display = "none";
  }

  const combinedIntervals: WorkInterval[] = [];
  workIntervals.sort((a, b) => a.start.getTime() - b.start.getTime());

  let currentInterval = workIntervals[0];
  for (let i = 1; i < workIntervals.length; i++) {
    if (workIntervals[i].start.getTime() <= currentInterval.end.getTime()) {
      currentInterval.end = new Date(
        Math.max(currentInterval.end.getTime(), workIntervals[i].end.getTime())
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
    if (interval.start.getTime() > lastEnd.getTime()) {
      appendSlot(attendance, lastEnd, interval.start, "red");
    }
    appendSlot(attendance, interval.start, interval.end, "green");
    lastEnd = interval.end;
  });

  if (lastEnd.getTime() < endOfWorkDay.getTime()) {
    appendSlot(attendance, lastEnd, endOfWorkDay, "red");
  }

  if (showTotal) {
    const attendanceSpecificDateElement = document.getElementById("attendance-specific-date") as HTMLElement;
    if (attendanceSpecificDateElement) {
      attendanceSpecificDateElement.style.display = "block";
    }

    const totalHours = document.getElementById("total-hours") as HTMLElement;
    if (totalHours) {
      const roundedMinutes = Math.round(totalMinutes);
      totalHours.innerText = `Total working hours: ${Math.floor(
        roundedMinutes / 60
      )} hrs ${roundedMinutes % 60} mins`;
    }
  }

  const firstLoginDisplay = document.getElementById("first-login-time") as HTMLElement;
  const lastLogoutDisplay = document.getElementById("last-logout-time") as HTMLElement;
  if (firstLoginDisplay) {
    firstLoginDisplay.innerText = firstLoginTime ? `Login Time: ${formatTime(firstLoginTime)}` : "Login Time: N/A";
  }
  if (lastLogoutDisplay) {
    lastLogoutDisplay.innerText = lastLogoutTime ? `Logout Time: ${formatTime(lastLogoutTime)}` : "Logout Time: N/A";
  }

  return attendanceDetails;
}

function appendSlot(parent: HTMLElement, start: Date, end: Date, color: string): void {
  const slotElement = document.createElement("div");
  slotElement.className = `slot ${color}`;
  const widthPercentage = ((end.getTime() - start.getTime()) / (9 * 60 * 60 * 1000)) * 100;
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

function formatTime(date: Date): string {
  return date.toTimeString().split(" ")[0].slice(0, 5);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const email: string = user.email || ""; // Ensure email is a string, or use a default value
        const emp_id = await fetchEmployeeIdByEmail(email);
        if (emp_id) {
          const todayDate = new Date().toISOString().slice(0, 10);
          const todayDateElement = document.getElementById("today-date") as HTMLElement;
          todayDateElement.innerText = formatDate(todayDate);
  
          fetchAttendance(emp_id, todayDate, "attendance-today");
  
          const submitButton = document.getElementById("submit-button") as HTMLElement;
          submitButton.addEventListener("click", async () => {
            const selectedDate = (document.getElementById("date-picker") as HTMLInputElement).value;
            const selectedDateElement = document.getElementById("selected-date") as HTMLElement;
            selectedDateElement.innerText = formatDate(selectedDate);
            const attendanceDetails = await fetchAttendance(emp_id, selectedDate, "attendance-details", true);
            if (Array.isArray(attendanceDetails)) {
              populateAttendanceModal(attendanceDetails);
            } else {
              console.error("Failed to fetch attendance details or attendanceDetails is not an array.");
            }
          });
  
          const viewDetailsButton = document.getElementById("view-details-button") as HTMLElement;
          viewDetailsButton.addEventListener("click", () => {
            const selectedDate = (document.getElementById("selected-date") as HTMLElement).innerText;
            const modalSelectedDateElement = document.getElementById("modal-selected-date") as HTMLElement;
            modalSelectedDateElement.innerText = selectedDate;
            $("#attendanceModal").modal("show");
          });
  
          const datePicker = document.getElementById("date-picker") as HTMLInputElement;
          datePicker.max = todayDate;
        } else {
          console.error("Employee ID not found for the user.");
        }
      } else {
        console.error("User is not authenticated or user is null.");
      }
    });
  });
  
  
  

function populateAttendanceModal(attendanceDetails: AttendanceDetail[]): void {
  const tableBody = document.getElementById("attendance-details-table") as HTMLElement;
  tableBody.innerHTML = "";

  if (Array.isArray(attendanceDetails) && attendanceDetails.length > 0) {
    attendanceDetails.forEach((detail, index) => {
      const row = document.createElement("tr");
      const slNoCell = document.createElement("td");
      const inTimeCell = document.createElement("td");
      const outTimeCell = document.createElement("td");

      slNoCell.innerText = (index + 1).toString();
      inTimeCell.innerText = detail.inTime ? formatTime(detail.inTime) : "N/A";
      outTimeCell.innerText = detail.outTime ? formatTime(detail.outTime) : "N/A";

      row.appendChild(slNoCell);
      row.appendChild(inTimeCell);
      row.appendChild(outTimeCell);
      tableBody.appendChild(row);
    });
  } else {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.innerText = "No attendance records available.";
    row.appendChild(cell);
    tableBody.appendChild(row);
  }
}
