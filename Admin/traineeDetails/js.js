// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import { getFirestore, collection, query, orderBy, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Your web app's Firebase configuration
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
const analytics = getAnalytics(app);
const db = getFirestore(app);

const profileContainer = document.getElementById('profileContainer');
const profileCardWidth = 160; 
let visibleCards = 4;
let scrollPosition = 0;

function updateVisibleCards() {
    visibleCards = window.innerWidth <= 768 ? 2 : 4;
}

function scrollLeft() {
    if (scrollPosition > 0) {
        scrollPosition -= profileCardWidth * visibleCards;
        profileContainer.style.transform = `translateX(-${scrollPosition}px)`;
    }
}

function scrollRight() {
    if (scrollPosition < profileContainer.scrollWidth - (profileCardWidth * visibleCards)) {
        scrollPosition += profileCardWidth * visibleCards;
        profileContainer.style.transform = `translateX(-${scrollPosition}px)`;
    }
}

document.getElementById('scrollLeftBtn').addEventListener('click', scrollLeft);
document.getElementById('scrollRightBtn').addEventListener('click', scrollRight);
window.addEventListener('resize', updateVisibleCards);
updateVisibleCards();

async function fetchEmployeeIds(batch) {
    const empIds = [];
    const q = query(collection(db, 'employee_details'), where('Batch', '==', batch));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach(doc => {
      empIds.push(doc.data().emp_id);
    });
    return empIds;
}

async function fetchAndDisplayEmployeeDetails(empIds) {
    for (const empId of empIds) {
        const q = query(collection(db, 'employee_details'), where('emp_id', '==', empId));
        const querySnapshot = await getDocs(q);
     
        querySnapshot.forEach(doc => {
            const employeeData = doc.data();

            // Create profile card
            const profileCard = document.createElement('div');
            profileCard.classList.add('profile-card');
            profileCard.innerHTML = `
                <div class="profile-front">
                    <img src="${employeeData.profileImage}" alt="${employeeData.emp_name}" class="profile-image">
                    <h4>${employeeData.emp_name}</h4>
                    <p>${employeeData.Designation}</p>
                </div>
                <div class="profile-back">
                    <h4>${employeeData.emp_name}</h4>
                    <p>${employeeData.Designation}</p>
                    <button class="btn btn-primary view-profile-btn" data-empid="${employeeData.emp_id}">View Profile</button>
                </div>
            `;
            profileContainer.appendChild(profileCard);

            profileCard.addEventListener('mouseenter', () => {
                profileCard.classList.add('flipped');
            });

            profileCard.addEventListener('mouseleave', () => {
                profileCard.classList.remove('flipped');
            });

            profileCard.querySelector('.view-profile-btn').addEventListener('click', (event) => {
                const empId = event.target.getAttribute('data-empid');
                openProfileModal(empId);
            });
        });
    }
}

function openProfileModal(empId) {
    $('#profileModal').modal('show');

    document.getElementById('dailyAttendanceBtn').addEventListener('click', () => {
        localStorage.setItem('selectedEmpId', empId);
        window.location.href = 'dailyAttendance.html';
    });

    document.getElementById('monthlyAttendanceBtn').addEventListener('click', () => {
        localStorage.setItem('selectedEmpId', empId);
        $('#profileModal').modal('hide');
        $('#monthModal').modal('show');
    });

    document.getElementById('lossOfPayBtn').addEventListener('click', () => {
        localStorage.setItem('selectedEmpId', empId);
        window.location.href = 'lossOfPay.html';
    });

    document.getElementById('profileBtn').addEventListener('click', () => {
        localStorage.setItem('selectedEmpId', empId);
        window.location.href = 'profile.html';
    });
}

document.getElementById('submitMonthBtn').addEventListener('click', () => {
    const selectedMonth = document.getElementById('monthSelect').value;
    localStorage.setItem('selectedMonth', selectedMonth);
    $('#monthModal').modal('hide');
    window.location.href = 'monthlyAttendance.html';
});

document.getElementById('searchInput').addEventListener('input', function () {
    const searchBtn = document.getElementById('searchBtn');
    searchBtn.disabled = this.value.trim() === '';
});

document.getElementById('searchBtn').addEventListener('click', function () {
    const searchValue = document.getElementById('searchInput').value.trim().toLowerCase();
    if (searchValue !== '') {
        searchEmployee(searchValue);
    }
});

async function searchEmployee(name) {
    const q = query(collection(db, 'employee_details'), where('emp_name', '==', name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
            const empId = doc.data().emp_id;
            localStorage.setItem('selectedEmpId', empId);
            window.location.href = 'profile.html';
        });
    } else {
        document.getElementById('errorMessage').textContent = 'Trainee does not exist';
    }
}

document.getElementById('downloadBtn').addEventListener('click', function () {
    const table = document.getElementById('attendance-table');
    const rows = table.querySelectorAll('tr');

    const csvContent = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('th, td');
        return Array.from(cells).map(cell => cell.textContent).join(',');
    }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'attendance.csv');
    a.click();
});

window.addEventListener('load', async () => {
    const empIds = await fetchEmployeeIds('batchName');
    await fetchAndDisplayEmployeeDetails(empIds);
});

async function fetchAttendanceRecords() {
    const q = query(collection(db, 'attendance'), orderBy('emp_id'), orderBy('date'));
    const querySnapshot = await getDocs(q);
    const attendanceTable = document.getElementById('attendance-table');
    attendanceTable.innerHTML = '';

    querySnapshot.forEach(doc => {
        const record = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.emp_id}</td>
            <td>${record.date}</td>
            <td>${record.loginTime}</td>
            <td>${record.logoutTime}</td>
        `;
        attendanceTable.appendChild(row);
    });
}

window.addEventListener('load', fetchAttendanceRecords);
