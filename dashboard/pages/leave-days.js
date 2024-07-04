import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function() {
    const monthSelect = document.getElementById("month");
    const yearSelect = document.getElementById("year");
    const calendarTitle = document.getElementById("calendar-title");

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [2021, 2022, 2023, 2024, 2025];

    months.forEach(month => {
        const option = document.createElement("option");
        option.text = month;
        option.value = month;
        monthSelect.add(option);
    });

    years.forEach(year => {
        const option = document.createElement("option");
        option.text = year;
        option.value = year;
        yearSelect.add(option);
    });

    // Set the current month and year
    const currentDate = new Date();
    const currentMonth = months[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;

    // Set the calendar title to the current month and year
    calendarTitle.innerText = `${currentMonth} ${currentYear}`;

    // Fetch data for the current month and year on page load
    fetchLeaveData();

    // Fetch data when month or year changes
    monthSelect.addEventListener('change', fetchLeaveData);
    yearSelect.addEventListener('change', fetchLeaveData);
});

// Fetch leave data from Firebase
async function fetchLeaveData() {
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;
    const calendarTitle = document.getElementById('calendar-title');

    if (month === 'Select month' || year === 'Select year') {
        return;
    }

    // Update the calendar title to the selected month and year
    calendarTitle.innerText = `${month} ${year}`;

    const leaveDataRef = collection(db, 'leaveData');
    const q = query(leaveDataRef, where('month', '==', month), where('year', '==', year));
    const querySnapshot = await getDocs(q);

    let leaveData = null;
    querySnapshot.forEach((doc) => {
        leaveData = doc.data();
    });

    if (leaveData) {
        populateCalendar(leaveData);
        updateSummary(leaveData);
    }
}

// Populate the calendar with leave data
function populateCalendar(data) {
    const calendarBody = document.getElementById('calendar-body');
    calendarBody.innerHTML = '';

    for (let i = 0; i < data.days.length; i += 7) {
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            if (data.days[i + j]) {
                cell.innerText = data.days[i + j].date;
                if (data.days[i + j].type === 'working') {
                    cell.className = 'working-day';
                } else if (data.days[i + j].type === 'partial-leave') {
                    cell.className = 'partial-leave';
                } else if (data.days[i + j].type === 'full-leave') {
                    cell.className = 'full-leave';
                }
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }
}

// Update the summary section with leave data
function updateSummary(data) {
    document.getElementById('total-working-day').innerText = data.summary.totalWorkingDay;
    document.getElementById('total-full-day-leave').innerText = data.summary.totalFullDayLeave;
    document.getElementById('total-half-day-leave').innerText = data.summary.totalHalfDayLeave;
}