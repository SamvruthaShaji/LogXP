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
    if (window.innerWidth <= 768) {
        visibleCards = 2;
    } else {
        visibleCards = 4;
    }
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

// Function to fetch employee IDs based on batch and store them in an array 
async function fetchEmployeeIds(batch) {
    const empIds = [];
    const q = query(collection(db, 'employee_details'), where('Batch', '==', batch));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach(doc => {
      empIds.push(doc.data().emp_id);
    });
    return empIds;
}

// Fetch and display employee details
async function fetchAndDisplayEmployeeDetails(empIds) {
    for (const empId of empIds) {
        const q = query(collection(db, 'employee_details'), where('emp_id', '==', empId));
        const querySnapshot = await getDocs(q);
     
        querySnapshot.forEach(doc => {
            const employeeData = doc.data();

            // Create profile card
            const profileCard = document.createElement('div');
            profileCard.classList.add('profile-card');

            
            const profileCardInner = document.createElement('div');
    profileCardInner.classList.add('profile-card-inner');
    profileCard.appendChild(profileCardInner);
            
            const profileCardFront = document.createElement('div');
            profileCardFront.classList.add('profile-card-front');
            profileCardInner.appendChild(profileCardFront);
            
            
    const profilePic = document.createElement('img');
    profilePic.id = `profile-pic-${empId}`;
    profilePic.alt = "Profile Picture";
    profilePic.classList.add('img-thumbnail');
    profilePic.style.width = '60px';
    profilePic.style.height = '60px';
    profilePic.style.borderRadius = '50%';
    profilePic.style.marginBottom = '5px';
    profileCardFront.appendChild(profilePic);

    const empid = document.createElement('h4');
    empid.id = `emp-id-${empId}`;
    profileCardFront.appendChild(empid);
  
    const empName = document.createElement('h5');
    empName.id = `emp-name-${empId}`;
    profileCardFront.appendChild(empName);

    const empPosition = document.createElement('p');
    empPosition.id = `emp-position-${empId}`;
    profileCardFront.appendChild(empPosition);

    const profileCardBack = document.createElement('div');
    profileCardBack.classList.add('profile-card-back');
    profileCardInner.appendChild(profileCardBack);

    const backEmpName = document.createElement('h4');
    backEmpName.id = `back-emp-name-${empId}`;
    profileCardBack.appendChild(backEmpName);

    const month = document.createElement('p');
    month.id = `month-${empId}`;
    profileCardBack.appendChild(month);

    const total = document.createElement('p');
    total.id = `total-${empId}`;
    profileCardBack.appendChild(total);

    // Add "View Profile" button
    const profileButton = document.createElement('button');
    profileButton.id = `profilebtn-${empId}`;
    profileButton.classList.add('btn', 'btn-secondary', 'btn-sm');
    profileButton.innerText = 'View Profile';
    profileCardBack.appendChild(profileButton);

    // Attach event listener to the button
    profileButton.addEventListener('click', () => {
        // Set the employee ID in the modal's buttons for later use
        document.getElementById('dailyAttendanceBtn').setAttribute('data-emp-id', empId);
        document.getElementById('monthlyAttendanceBtn').setAttribute('data-emp-id', empId);
        document.getElementById('lossOfPayBtn').setAttribute('data-emp-id', empId);
        document.getElementById('profileBtn').setAttribute('data-emp-id', empId);

        // Show the modal
        $('#profileModal').modal('show');
    });

    // Append profile card to container
    profileContainer.appendChild(profileCard);

    // Fetch and display trainee details
    const q = query(collection(db, 'employee_details'), where('emp_id', '==', empId));
getDocs(q).then(querySnapshot => {
    querySnapshot.forEach(doc => {
        const data = doc.data();
        profilePic.src = data.profile_pic;
        empid.innerHTML = data.emp_id;
        
        empName.innerText = data.emp_name;
        backEmpName.innerText = data.emp_name;
        empPosition.innerText = data.emp_position;
    });
}).catch(error => {
    console.error('Error getting document: ', error);
});

    // Fetch and display performance details
    // Assuming db is already initialized
    const performanceQuery = query(collection(db, 'performance_details'), where('emp_id', '==', empId));
    getDocs(performanceQuery).then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const data = doc.data();
            month.innerText = `Month: ${data.month}`;
            total.innerText = `Total: ${data.total}%`;
        });
    }).catch(error => {
        console.error('Error getting performance details: ', error);
    });

            
           
        });
    }
}

// Fetch and display attendance details for multiple employees
async function fetchAttendanceDetails(empIds) {
    try {
        const attendanceTable = document.getElementById('attendance-table');
        attendanceTable.innerHTML = ''; // Clear the table before appending new rows
        const attendanceRecords = [];

        for (const empId of empIds) {
            const attendanceQuery = query(
                collection(db, 'in_out_details'),
                where('emp_id', '==', empId),
                orderBy('timestamp')
            );

            const querySnapshot = await getDocs(attendanceQuery);

            querySnapshot.forEach(doc => {
                const data = doc.data();
                attendanceRecords.push({
                    empId: data.emp_id,
                    date: data.timestamp.toDate(),
                    time: data.timestamp.toDate(),
                    status: data.status
                });
            });
        }

        // Process attendance records to find first login and last logout for each date
        const attendanceSummary = {};

        attendanceRecords.forEach(record => {
            const formattedDate = record.date.toLocaleDateString('en-GB'); // Format date as dd/mm/yyyy
            if (!attendanceSummary[record.empId]) {
                attendanceSummary[record.empId] = {};
            }
            if (!attendanceSummary[record.empId][formattedDate]) {
                attendanceSummary[record.empId][formattedDate] = {
                    firstLogin: null,
                    lastLogout: null
                };
            }

            if (record.status === 1) { // Assuming 1 is login
                if (!attendanceSummary[record.empId][formattedDate].firstLogin || record.time < attendanceSummary[record.empId][formattedDate].firstLogin) {
                    attendanceSummary[record.empId][formattedDate].firstLogin = record.time;
                }
            } else if (record.status === 2) { // Assuming 2 is logout
                if (!attendanceSummary[record.empId][formattedDate].lastLogout || record.time > attendanceSummary[record.empId][formattedDate].lastLogout) {
                    attendanceSummary[record.empId][formattedDate].lastLogout = record.time;
                }
            }
        });

        // Convert attendanceSummary into a sorted array
        const sortedRecords = [];

        Object.keys(attendanceSummary).forEach(empId => {
            Object.keys(attendanceSummary[empId]).forEach(date => {
                const summary = attendanceSummary[empId][date];
                if (summary.firstLogin && summary.lastLogout) {
                    sortedRecords.push({
                        empId,
                        date: new Date(date.split('/').reverse().join('/')), // Convert dd/mm/yyyy to Date object for sorting
                        firstLogin: summary.firstLogin,
                        lastLogout: summary.lastLogout
                    });
                }
            });
        });

        // Sort records by date in descending order
        sortedRecords.sort((a, b) => b.date - a.date);

        // Append sorted records to the table
        sortedRecords.forEach(record => {
            const formattedDate = record.date.toLocaleDateString('en-GB'); // Format date as dd/mm/yyyy
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.empId}</td>
                <td>${formattedDate}</td>
                <td>${record.firstLogin.toLocaleTimeString()}</td>
                <td>${record.lastLogout.toLocaleTimeString()}</td>
            `;
            attendanceTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error getting attendance details: ', error);
    }
}

// Retrieve batch ID from URL query string
const urlParams = new URLSearchParams(window.location.search);
const batchId = urlParams.get('batchId');
// Fetch employee IDs and then fetch and display employee details
if (batchId) {
  fetchEmployeeIds(batchId).then(empIds => {
    const assendingEmployees = sortEmployeeIds(empIds);
    fetchAndDisplayEmployeeDetails(assendingEmployees);
    fetchAttendanceDetails(assendingEmployees); 
  });

}

// Search functionality
function searchTrainee() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const profileCards = document.querySelectorAll('.profile-card');
    let traineeFound = false;

    profileCards.forEach(card => {
        const name = card.querySelector('h5').innerText.toLowerCase();
        if (name === searchInput) {
            const imgSrc = card.querySelector('img').src;
           

            // Redirect to profile page with trainee details
            window.location.href = "../../profile/profile.html";
            traineeFound = true;
        }
    });
    if (!traineeFound) {
        document.getElementById('errorMessage').innerText = 'Trainee does not exist.';
    } else {
        document.getElementById('errorMessage').innerText = '';
    }
}

// Enable or disable the search button based on input length
function toggleSearchButton() {
    const searchInput = document.getElementById('searchInput').value;
    const searchBtn = document.getElementById('searchBtn');
    if (searchInput.length >= 3) {
        searchBtn.disabled = false;
    } else {
        searchBtn.disabled = true;
    }
}

// Function to handle month selection
document.getElementById('downloadBtn').addEventListener('click', () => {
    $('#monthModal').modal('show');
});

document.getElementById('submitMonthBtn').addEventListener('click', () => {
    const selectedMonth = document.getElementById('monthSelect').value;
    if (selectedMonth) {
        const confirmed = confirm(`Do you want to download attendance for ${selectedMonth}?`);
        if (confirmed) {
            const selectedEmpId = sessionStorage.getItem('selectedEmpId');
            if (selectedEmpId) {
                fetchAndDownloadAttendanceDetails(selectedEmpId, selectedMonth);
            } else {
                alert("No employee selected.");
            }
        }
        $('#monthModal').modal('hide');
    }
});

// Fetch and download attendance details based on selected employee and month
async function fetchAndDownloadAttendanceDetails(empId, month) {
    const q = query(collection(db, 'attendance'), where('emp_id', '==', empId));
    const querySnapshot = await getDocs(q);

    const attendanceData = [];
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.date);
        const selectedDate = new Date(month);

        if (date.getFullYear() === selectedDate.getFullYear() && date.getMonth() === selectedDate.getMonth()) {
            attendanceData.push(data);
        }
    });

    if (attendanceData.length > 0) {
        const csvContent = "data:text/csv;charset=utf-8,"
            + attendanceData.map(e => `${e.emp_id},${e.date},${e.login_time},${e.logout_time}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${empId}_attendance_${month}.csv`);
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
    } else {
        alert("No attendance data found for the selected month.");
    }
}

// Event listeners for profile modal buttons


document.getElementById('dailyAttendanceBtn').addEventListener('click', (event) => {
    const empId = event.target.getAttribute('data-emp-id');
    window.location.href = `dailyAttendance.html?emp_id=${empId}`;
});

document.getElementById('monthlyAttendanceBtn').addEventListener('click', (event) => {
    const empId = event.target.getAttribute('data-emp-id');
    window.location.href = `../traineepages/monthlyattendence/monthlyAtt.html?emp_id=${empId}`;
});

document.getElementById('lossOfPayBtn').addEventListener('click', (event) => {
    const empId = event.target.getAttribute('data-emp-id');
    window.location.href = `lossOfPay.html?emp_id=${empId}`;
});

document.getElementById('profileBtn').addEventListener('click', (event) => {
    const empId = event.target.getAttribute('data-emp-id');
    window.location.href = `profile.html?emp_id=${empId}`;
});

// Event listener for search functionality
document.getElementById('searchBtn').addEventListener('click', async () => {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const q = query(collection(db, 'employee_details'));
    const querySnapshot = await getDocs(q);

    let found = false;

    querySnapshot.forEach(doc => {
        const employeeData = doc.data();
        if (employeeData.name.toLowerCase() === searchInput) {
            sessionStorage.setItem('selectedEmpId', employeeData.emp_id);
            fetchAndDisplayAttendanceDetails(employeeData.emp_id);
            found = true;
        }
    });

    if (!found) {
        document.getElementById('errorMessage').innerText = 'Trainee does not exist';
    } else {
        document.getElementById('errorMessage').innerText = '';
    }
});


document.getElementById('searchInput').addEventListener('input', toggleSearchButton);
document.getElementById('searchBtn').addEventListener('click', searchTrainee);

document.getElementById('searchInput').addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        const q = query(collection(db, 'employee_details'));
        const querySnapshot = await getDocs(q);

        let found = false;

        querySnapshot.forEach(doc => {
            const employeeData = doc.data();
            if (employeeData.name.toLowerCase() === searchInput) {
                sessionStorage.setItem('selectedEmpId', employeeData.emp_id);
                fetchAndDisplayAttendanceDetails(employeeData.emp_id);
                found = true;
            }
        });

        if (!found) {
            document.getElementById('errorMessage').innerText = 'Trainee does not exist';
        } else {
            document.getElementById('errorMessage').innerText = '';
        }
    }
});

// Initialize the search button state on page load
toggleSearchButton();


//function to sort employee based on their empid

function sortEmployeeIds(empIds) {
    return empIds.sort((a, b) => {
      // Extract the numeric part of each employee ID
      const numA = parseInt(a.replace('emp', ''));
      const numB = parseInt(b.replace('emp', ''));
      
      // Compare the numeric parts
      return numA - numB;
    });
  }