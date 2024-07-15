// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, doc, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";


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
                const record = {
                    id: data.emp_id,
                    date: data.date,
                    loginTime: data.login_time,
                    logoutTime: data.logout_time,
                };
                attendanceRecords.push(record);
            });
        }

        attendanceTable.innerHTML = attendanceRecords.map(record => `
            <tr>
                <td>${record.id}</td>
                <td>${record.date}</td>
                <td>${record.loginTime}</td>
                <td>${record.logoutTime}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error fetching attendance details:', error);
    }
}

// Fetch data for a specific batch
async function fetchBatchData(batch) {
    try {
        const empIds = await fetchEmployeeIds(batch);
        await fetchAttendanceDetails(empIds);
    } catch (error) {
        console.error('Error fetching batch data:', error);
    }
}

// Upload Data Modal Event Listeners
document.getElementById('excelbutton').addEventListener('click', () => {
    $('#uploadModal').modal('show');
});
// Function to handle file upload
document.getElementById('fileInput').addEventListener('change', handleFileUpload);

let uploadedData = null;

function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        uploadedData = XLSX.utils.sheet_to_json(worksheet);
        console.log(uploadedData);
    };

    reader.readAsArrayBuffer(file);
}

document.getElementById('viewDataBtn').addEventListener('click', () => {
    if (uploadedData) {
        const uploadedDataDiv = document.getElementById('uploadedData');
        let tableHtml = '<table border="1"><tr>';
        // Create table headers based on keys of the first object
        const headers = Object.keys(uploadedData[0]);
        headers.forEach(header => {
            tableHtml += `<th>${header}</th>`;
        });
        tableHtml += '</tr>';

        // Create table rows
        uploadedData.forEach(record => {
            tableHtml += '<tr>';
            headers.forEach(header => {
                tableHtml += `<td>${record[header]}</td>`;
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</table>';
        uploadedDataDiv.innerHTML = tableHtml;
    }
});

document.getElementById('clearDataBtn').addEventListener('click', () => {
    document.getElementById('fileInput').value = '';
    uploadedData = null;
    document.getElementById('uploadedData').innerHTML = '';
});

document.getElementById('saveDataBtn').addEventListener('click', async () => {
    if (uploadedData) {
        try {
            const batch = writeBatch(db);

            uploadedData.forEach((record) => {
                // Extract required fields emp_id, status, timestamp
                const { emp_id, status, timestamp } = record;

                // Parse timestamp using moment.js
                const parsedTimestamp = moment(timestamp, 'MMMM DD, YYYY [at] hh:mm:ss A Z').toDate();

                // Check if parsedTimestamp is a valid Date
                if (isNaN(parsedTimestamp.getTime())) {
                    console.error('Invalid timestamp:', timestamp);
                    return; // Skip this record if timestamp is invalid
                }

                // Convert timestamp to Firestore Timestamp format
                const timestampFirestore = Timestamp.fromDate(parsedTimestamp);

                // Create a new document reference for each record
                const docRef = doc(collection(db, 'in_out_details'));

                // Set the document data with emp_id, status, and timestamp
                batch.set(docRef, { emp_id, status, timestamp: timestampFirestore });
            });

            // Commit the batch write
            await batch.commit();
            alert('Data saved successfully!');
            $('#uploadModal').modal('hide');
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data. Please try again.');
        }
    }
});

// Attach event listeners to profile action buttons
document.querySelectorAll('.profile-card').forEach(card => {
    card.addEventListener('click', () => {
        $('#profileModal').modal('show');
    });
});

document.getElementById('dailyAttendanceBtn').addEventListener('click', () => {
    window.location.href = 'daily.html';
});

document.getElementById('monthlyAttendanceBtn').addEventListener('click', () => {
    window.location.href = 'monthly.html';
});

document.getElementById('lossOfPayBtn').addEventListener('click', () => {
    window.location.href = 'lop.html';
});

document.getElementById('profileBtn').addEventListener('click', () => {
    window.location.href = 'profile.html';
});

document.getElementById('searchBtn').addEventListener('click', async () => {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const errorMessage = document.getElementById('errorMessage');

    if (searchInput === '') {
        errorMessage.textContent = 'Please enter a valid batch number.';
        return;
    }

    errorMessage.textContent = '';
    await fetchBatchData(searchInput);
});
