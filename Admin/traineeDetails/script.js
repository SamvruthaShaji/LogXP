// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import { getFirestore, collection, query,orderBy,where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


  
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const profileCardWidth = 160; // Width of profile card plus margin
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

// Fetch and display attendance details for multiple employees
async function fetchAttendanceDetails(empIds) {
    try {
        const attendanceTable = document.getElementById('attendance-table');
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
                    date: data.timestamp.toDate().toLocaleDateString(),
                    time: data.timestamp.toDate(),
                    status: data.status
                });
            });
        }

        // Process attendance records to find first login and last logout for each date
        const attendanceSummary = {};

        attendanceRecords.forEach(record => {
            if (!attendanceSummary[record.empId]) {
                attendanceSummary[record.empId] = {};
            }
            if (!attendanceSummary[record.empId][record.date]) {
                attendanceSummary[record.empId][record.date] = {
                    firstLogin: null,
                    lastLogout: null
                };
            }

            if (record.status === 1) { // Assuming 1 is login
                if (!attendanceSummary[record.empId][record.date].firstLogin || record.time < attendanceSummary[record.empId][record.date].firstLogin) {
                    attendanceSummary[record.empId][record.date].firstLogin = record.time;
                }
            } else if (record.status === 2) { // Assuming 2 is logout
                if (!attendanceSummary[record.empId][record.date].lastLogout || record.time > attendanceSummary[record.empId][record.date].lastLogout) {
                    attendanceSummary[record.empId][record.date].lastLogout = record.time;
                }
            }
        });

        // Append summary to the table
        Object.keys(attendanceSummary).forEach(empId => {
            Object.keys(attendanceSummary[empId]).forEach(date => {
                const summary = attendanceSummary[empId][date];
                if (summary.firstLogin && summary.lastLogout) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${empId}</td>
                        <td>${date}</td>
                        <td>${summary.firstLogin.toLocaleTimeString()}</td>
                        <td>${summary.lastLogout.toLocaleTimeString()}</td>
                    `;
                    attendanceTable.appendChild(row);
                }
            });
        });
    } catch (error) {
        console.error('Error getting attendance details: ', error);
    }
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
  
    
// Retrieve batch ID from URL query string
const urlParams = new URLSearchParams(window.location.search);
const batchId = urlParams.get('batchId');
// Fetch employee IDs and then fetch and display employee details
if (batchId) {
  fetchEmployeeIds(batchId).then(empIds => {
   
    fetchAndDisplayEmployeeDetails(empIds);
    fetchAttendanceDetails(empIds); 
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
            window.location.href = '../profile/profile.html';
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

document.getElementById('searchInput').addEventListener('input', toggleSearchButton);
document.getElementById('searchBtn').addEventListener('click', searchTrainee);
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        if (!document.getElementById('searchBtn').disabled) {
            searchTrainee();
        }
    }
});

// Initialize the search button state on page load
toggleSearchButton();


// Modal button actions
document.getElementById('dailyAttendanceBtn').addEventListener('click', (event) => {
    const empId = event.target.getAttribute('data-emp-id');
    window.location.href = `dailyAttendance.html?emp_id=${empId}`;
});

document.getElementById('monthlyAttendanceBtn').addEventListener('click', (event) => {
    const empId = event.target.getAttribute('data-emp-id');
    window.location.href = `monthlyAttendance.html?emp_id=${empId}`;
});

document.getElementById('lossOfPayBtn').addEventListener('click', (event) => {
    const empId = event.target.getAttribute('data-emp-id');
    window.location.href = `lossOfPay.html?emp_id=${empId}`;
});

document.getElementById('profileBtn').addEventListener('click', (event) => {
    const empId = event.target.getAttribute('data-emp-id');
    window.location.href = `profile.html?emp_id=${empId}`;
});