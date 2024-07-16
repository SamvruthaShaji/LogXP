import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    QuerySnapshot,
    DocumentData,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Modal } from 'bootstrap';

// Firebase configuration
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

// Interface for attendance details
interface AttendanceDetail {
    slNo: number;
    inTime: Date;
    outTime?: Date;
}

// Function to fetch employee ID by email
async function fetchEmployeeIdByEmail(email: string): Promise<string | null> {
    const q = query(collection(db, "employee_details"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.error("No employee found with email:", email);
        return null;
    } else {
        const employeeDoc = querySnapshot.docs[0];
        return employeeDoc.data().emp_id;
    }
}

// Function to fetch attendance based on date and emp_id
async function fetchAttendance(
    emp_id: string,
    date: string,
    elementId: string,
    showTotal = false
): Promise<AttendanceDetail[]> {
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

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    console.log("Total records fetched:", querySnapshot.size);

    const attendance = document.getElementById(elementId) as HTMLElement;
    attendance.innerHTML = "";
    let totalMinutes = 0;
    const workIntervals: { start: Date; end: Date }[] = [];

    let currentInTime: Date | null = null;
    let firstLoginTime: Date | null = null;
    let lastLogoutTime: Date | null = null;

    const attendanceDetails: AttendanceDetail[] = [];

    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        const timestamp: Date = data.timestamp.toDate();
        if (data.status === 1) {
            if (!firstLoginTime) {
                firstLoginTime = timestamp;
            }
            currentInTime = timestamp;
            attendanceDetails.push({ slNo: attendanceDetails.length + 1, inTime: timestamp });
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
        document.getElementById("no-details-message")!.style.display = "block";
        return attendanceDetails;
    } else {
        document.getElementById("no-details-message")!.style.display = "none";
    }

    const combinedIntervals: { start: Date; end: Date }[] = [];
    workIntervals.sort((a, b) => a.start.getTime() - b.start.getTime());

    let currentInterval = workIntervals[0];
    for (let i = 1; i < workIntervals.length; i++) {
        if (workIntervals[i].start <= currentInterval.end) {
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
function appendSlot(parent: HTMLElement, start: Date, end: Date, color: string) {
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

// Function to format time to HH:mm format
function formatTime(date: Date): string {
    return date.toTimeString().split(" ")[0].slice(0, 5);
}

// Function to format date to yyyy-mm-dd format
function formatDate(date: string): string {
    const d = new Date(date);
    const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const mo = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(d);
    const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
    return `${ye}-${mo}-${da}`;
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
            const email = user.email!;
            const emp_id = await fetchEmployeeIdByEmail(email);
            if (emp_id) {
                const todayDate = new Date().toISOString().slice(0, 10);
                document.getElementById("today-date")!.innerText = formatDate(todayDate);

                fetchAttendance(emp_id, todayDate, "attendance-today");

                document.getElementById("submit-button")!.addEventListener("click", async () => {
                    const selectedDate = (document.getElementById("date-picker") as HTMLInputElement).value;
                    document.getElementById("selected-date")!.innerText = formatDate(selectedDate);
                    const attendanceDetails = await fetchAttendance(emp_id, selectedDate, "attendance-details", true);
                    if (Array.isArray(attendanceDetails)) {
                        populateAttendanceModal(attendanceDetails);
                    } else {
                        console.error("Failed to fetch attendance details or attendanceDetails is not an array.");
                    }
                });

                document.getElementById("view-details-button")!.addEventListener("click", () => {
                    const selectedDate = document.getElementById("selected-date")!.innerText;
                    document.getElementById("modal-selected-date")!.innerText = selectedDate;
                    const modal = new Modal(document.getElementById("attendance-modal")!);
                    modal.show();
                });
            }
        } else {
            window.location.href = "index.html";
        }
    });
});

// Function to populate the attendance modal with fetched details
function populateAttendanceModal(attendanceDetails: AttendanceDetail[]) {
    const modalBody = document.getElementById("attendance-modal-body");
    if (modalBody) {
        modalBody.innerHTML = "";
        if (attendanceDetails.length === 0) {
            modalBody.innerHTML = "<p>No attendance details available for the selected date.</p>";
        } else {
            const table = document.createElement("table");
            table.className = "table table-striped";
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            const headers = ["Sl No", "In Time", "Out Time"];
            headers.forEach((headerText) => {
                const th = document.createElement("th");
                th.innerText = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            attendanceDetails.forEach((detail) => {
                const row = document.createElement("tr");
                const slNoCell = document.createElement("td");
                slNoCell.innerText = detail.slNo.toString();
                row.appendChild(slNoCell);

                const inTimeCell = document.createElement("td");
                inTimeCell.innerText = formatTime(detail.inTime);
                row.appendChild(inTimeCell);

                const outTimeCell = document.createElement("td");
                outTimeCell.innerText = detail.outTime ? formatTime(detail.outTime) : "N/A";
                row.appendChild(outTimeCell);

                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            modalBody.appendChild(table);
        }
    }
}
