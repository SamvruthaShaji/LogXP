// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5tbpKUlx1BoJnxyHOibP7T_uymsYBXA0",
  authDomain: "logxp-31c62.firebaseapp.com",
  projectId: "logxp-31c62",
  storageBucket: "logxp-31c62.appspot.com",
  messagingSenderId: "17276012238",
  appId: "1:17276012238:web:464030eb3b2062bb55729f",
  measurementId: "G-FVZH4VFV6T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();


const profileContainer = document.getElementById("profileContainer");
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
  if (
    scrollPosition <
    profileContainer.scrollWidth - profileCardWidth * visibleCards
  ) {
    scrollPosition += profileCardWidth * visibleCards;
    profileContainer.style.transform = `translateX(-${scrollPosition}px)`;
  }
}

document.getElementById("scrollLeftBtn").addEventListener("click", scrollLeft);
document
  .getElementById("scrollRightBtn")
  .addEventListener("click", scrollRight);

window.addEventListener("resize", updateVisibleCards);
updateVisibleCards();

// Function to fetch employee IDs based on batch and store them in an array
async function fetchEmployeeIds(batch) {
  const empIds = [];
  const q = query(
    collection(db, "employee_details"),
    where("Batch", "==", batch)
  );
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    empIds.push(doc.data().emp_id);
  });
  return empIds;
}

// Fetch and display employee details
async function fetchAndDisplayEmployeeDetails(empIds) {
  for (const empId of empIds) {
    const q = query(
      collection(db, "employee_details"),
      where("emp_id", "==", empId)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const employeeData = doc.data();

      // Create profile card
      const profileCard = document.createElement("div");
      profileCard.classList.add("profile-card");

      const profileCardInner = document.createElement("div");
      profileCardInner.classList.add("profile-card-inner");
      profileCard.appendChild(profileCardInner);

      const profileCardFront = document.createElement("div");
      profileCardFront.classList.add("profile-card-front");
      profileCardInner.appendChild(profileCardFront);

      const profilePic = document.createElement("img");
      profilePic.id = `profile-pic-${empId}`;
      profilePic.alt = "Profile Picture";
      profilePic.classList.add("img-thumbnail");
      profilePic.style.width = "60px";
      profilePic.style.height = "60px";
      profilePic.style.borderRadius = "50%";
      profilePic.style.marginBottom = "5px";
      profilePic.style.backgroundColor = "#EA454C"; 
      profileCardFront.appendChild(profilePic);

      const empid = document.createElement("h4");
      empid.id = `emp-id-${empId}`;
      profileCardFront.appendChild(empid);

      const empName = document.createElement("h5");
      empName.id = `emp-name-${empId}`;
      profileCardFront.appendChild(empName);

      const profileCardBack = document.createElement("div");
      profileCardBack.classList.add("profile-card-back");
      profileCardInner.appendChild(profileCardBack);

      const backEmpName = document.createElement("h4");
      backEmpName.id = `back-emp-name-${empId}`;
      profileCardBack.appendChild(backEmpName);

      // Add "View Profile" button
      const profileButton = document.createElement("button");
      profileButton.id = `profilebtn-${empId}`;
      profileButton.classList.add("btn", "btn-sm"); // Remove 'btn-danger' to remove the red color
      profileButton.style.backgroundColor = "white"; // Set background color to white
      profileButton.style.color = "#EA454C"; // Set text color to #EA454C
      profileButton.innerText = "View Profile";
      profileCardBack.appendChild(profileButton);

      // Attach event listener to the button
      profileButton.addEventListener("click", () => {
        // Set the employee ID in the modal's buttons for later use
        document
          .getElementById("dailyAttendanceBtn")
          .setAttribute("data-emp-id", empId);
        document
          .getElementById("monthlyAttendanceBtn")
          .setAttribute("data-emp-id", empId);
        document
          .getElementById("lossOfPayBtn")
          .setAttribute("data-emp-id", empId);
        document
          .getElementById("profileBtn")
          .setAttribute("data-emp-id", empId);

        // Show the modal
        $("#profileModal").modal("show");
      });

      // Append profile card to container
      profileContainer.appendChild(profileCard);

      // Fetch and display trainee details
      const q = query(
        collection(db, "employee_details"),
        where("emp_id", "==", empId)
      );
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            profilePic.src = data.profile_pic;
            empid.innerHTML = data.emp_id;
            empName.innerText = data.emp_name;
            backEmpName.innerText = data.emp_name;        
          });
        })
        .catch((error) => {
          console.error("Error getting document: ", error);
        });

    });
  }
}

// Fetch and display attendance details for multiple employees

document.getElementById("month-select").addEventListener("change", selectMonth);

async function selectMonth() {
    const month = document.getElementById("month-select").value;
    if (month === "") {
        return;
    }

    // Fetch the employee IDs from the current batch
    const emIds = await  fetchEmployeeIds(batchId);

    await fetchAttendanceDetails(emIds, month);
}

async function fetchAttendanceDetails(empIds, month) {
    try {
        const attendanceTable = document.getElementById("attendance-table");
        attendanceTable.innerHTML = ""; // Clear the table before appending new rows
        const attendanceRecords = [];

        for (const empId of empIds) {
            const attendanceQuery = query(
                collection(db, "in_out_details"),
                where("emp_id", "==", empId),
                orderBy("timestamp")
            );

            const querySnapshot = await getDocs(attendanceQuery);

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const date = data.timestamp.toDate();
                if (date.getMonth() === parseInt(month)) {
                    attendanceRecords.push({
                        empId: data.emp_id,
                        date: date,
                        time: date,
                        status: data.status,
                    });
                }
            });
        }

        // Process attendance records as before
        const attendanceSummary = {};

        attendanceRecords.forEach((record) => {
            const formattedDate = record.date.toLocaleDateString("en-GB");
            if (!attendanceSummary[record.empId]) {
                attendanceSummary[record.empId] = {};
            }
            if (!attendanceSummary[record.empId][formattedDate]) {
                attendanceSummary[record.empId][formattedDate] = {
                    firstLogin: null,
                    lastLogout: null,
                };
            }

            if (record.status === 1) {
                if (
                    !attendanceSummary[record.empId][formattedDate].firstLogin ||
                    record.time < attendanceSummary[record.empId][formattedDate].firstLogin
                ) {
                    attendanceSummary[record.empId][formattedDate].firstLogin = record.time;
                }
            } else if (record.status === 2) {
                if (
                    !attendanceSummary[record.empId][formattedDate].lastLogout ||
                    record.time > attendanceSummary[record.empId][formattedDate].lastLogout
                ) {
                    attendanceSummary[record.empId][formattedDate].lastLogout = record.time;
                }
            }
        });

        // Convert attendanceSummary into a sorted array
        const sortedRecords = [];

        Object.keys(attendanceSummary).forEach((empId) => {
            Object.keys(attendanceSummary[empId]).forEach((date) => {
                const summary = attendanceSummary[empId][date];
                if (summary.firstLogin && summary.lastLogout) {
                    sortedRecords.push({
                        empId,
                        date: new Date(date.split("/").reverse().join("/")),
                        firstLogin: summary.firstLogin,
                        lastLogout: summary.lastLogout,
                    });
                }
            });
        });

        // Sort records by date in descending order
        sortedRecords.sort((a, b) => b.date - a.date);

        // Append sorted records to the table
        sortedRecords.forEach((record) => {
            const formattedDate = record.date.toLocaleDateString("en-GB");
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${record.empId}</td>
                <td>${formattedDate}</td>
                <td>${record.firstLogin.toLocaleTimeString()}</td>
                <td>${record.lastLogout.toLocaleTimeString()}</td>
            `;
            attendanceTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error getting attendance details: ", error);
    }
}




// Retrieve batch ID from URL query string
const urlParams = new URLSearchParams(window.location.search);
const batchId = urlParams.get("batchId");


// Fetch employee IDs and then fetch and display employee details
if (batchId) {
  fetchEmployeeIds(batchId).then((empIds) => {
    const assendingEmployees = sortEmployeeIds(empIds);
    fetchAndDisplayEmployeeDetails(assendingEmployees);
  });
}

// Function to fetch employees based on batchId
async function fetchEmployeesByBatch(batchId) {
  try {
  const employeesRef = collection(db, 'employee_details');
  const performanceQuery = query(employeesRef, where('Batch', '==', batchId));
  const snapshot = await getDocs(performanceQuery);

    const employees = [];

    snapshot.forEach(doc => {
      employees.push({ id: doc.id, ...doc.data() });
    });

    return employees;
  } 
  catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

// Function to fetch attendance details for an employee
async function fetchAttendance(empId, month) {
  const attendanceRef = collection(db, 'attendance_register');
  const attendanceQuery = query(
    attendanceRef,
    where('emp_id', '==', empId),
    where('month', '==', month)
  );

  const snapshot = await getDocs(attendanceQuery);
  const attendanceDetails = {
  presentDays: 0,
  absentDays: 0,
  halfDays: 0
};

snapshot.forEach(doc => {
  const status = doc.data().attendance_status;
  if (status === 'p') {
    attendanceDetails.presentDays += 1;
  } else if (status === 'a') {
    attendanceDetails.absentDays += 1;
  } else if (status === 'h') {
    attendanceDetails.halfDays += 1;
  }
});

return attendanceDetails;
}

// Function to fetch and download attendance details
async function fetchAndDownloadAttendanceDetails(batchId, month) {
  try {
    const employees = await fetchEmployeesByBatch(batchId);
    const attendanceData = [];
    for (const employee of employees) {
      const empId = employee.emp_id; 
      const attendanceDetails = await fetchAttendance(empId, month);
      attendanceData.push({
        empId: empId,
        name: employee.emp_name,
        ...attendanceDetails
      });
    }
   
    if (attendanceData.length > 0) {
      // const csv = convertToCSV(attendanceData);
      // triggerDownload(csv, `attendance_batch_${batchId}_${month}.csv`);
      console.log(attendanceData);
      // Convert the data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(attendanceData);
                // Print the worksheet contents to the console
                console.log(XLSX.utils.sheet_to_json(worksheet, { header: 1 }));
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

      // Write the workbook to an Excel file and trigger the download
      XLSX.writeFile(workbook, 'attendance.xlsx');
    } else {
      alert('No attendance data found for this batch and month.');
    }
  } catch (error) {
    console.error('Error fetching attendance details:', error);
  }
}
//Adding event listener to download button
document.getElementById('downloadAttendanceBtn').addEventListener('click', () => {
  // Show the modal when the download button is clicked
  $('#monthSelectModal').modal('show');
});

document.getElementById('confirmDownload').addEventListener('click', () => {
  const month = document.getElementById('monthSelect').value;
  if (month) {
      console.log(batchId);
      fetchAndDownloadAttendanceDetails(batchId, month);
      $('#monthSelectModal').modal('hide');
  } else {
      alert("Please select a month.");
  }
});



// Modal button actions
document.getElementById('dailyAttendanceBtn').addEventListener('click', (event) => {
    const empId = event.target.getAttribute('data-emp-id');
    window.location.href = `../traineepages/dailyattendence/dailyAttendence.html?emp_id=${empId}`;
});

document.getElementById('monthlyAttendanceBtn').addEventListener('click', (event) => {
  const empId = event.target.getAttribute('data-emp-id');
  window.location.href = `../traineepages/monthlyAttendence/monthlyAtt.html?emp_id=${empId}`;
});

document.getElementById("lossOfPayBtn").addEventListener("click", (event) => {
  const empId = event.target.getAttribute("data-emp-id");
  window.location.href = `../traineepages/leave/loppage.html?emp_id=${empId}`;
});

document.getElementById("profileBtn").addEventListener("click", (event) => {
  const empId = event.target.getAttribute("data-emp-id");
  window.location.href = `../traineepages/profile/profile.html?emp_id=${empId}`;
});

// Function to sort employees based on their empid
function sortEmployeeIds(empIds) {
  return empIds.sort((a, b) => {
    // Extract the numeric part of each employee ID
    const numA = parseInt(a.replace("emp", ""));
    const numB = parseInt(b.replace("emp", ""));

    // Compare the numeric parts
    return numA - numB;
  });
}

// Add search functionality
document.getElementById("searchBtn").addEventListener("click", async () => {
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const selectedBatchId = batchId;

  // Clear any existing error message
  document.getElementById("errorMessage").textContent = "";

  if (searchTerm) {
    const searchResults = [];
    const q = query(collection(db, "employee_details"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        (data.emp_name.toLowerCase().includes(searchTerm) || 
         data.emp_id.toLowerCase().includes(searchTerm)) && 
        data.Batch === selectedBatchId // Check if the batch ID matches
      ) {
        searchResults.push(data.emp_id);
      }
    });

    if (searchResults.length > 0) {
      profileContainer.innerHTML = ""; // Clear existing profiles
      fetchAndDisplayEmployeeDetails(sortEmployeeIds(searchResults));
      fetchAttendanceDetails(sortEmployeeIds(searchResults));
    } else {
      // Display error message
      const errorMessage = document.getElementById("errorMessage");
      errorMessage.textContent = "No results found for the selected batch";
    }
  }
});


async function fetchAllEmployees() {
  if (batchId) {
    const empIds = await fetchEmployeeIds(batchId);
    const sortedEmpIds = sortEmployeeIds(empIds);
    document.getElementById("errorMessage").textContent = "";
    document.getElementById("searchInput").value = "";
    profileContainer.innerHTML = ""; // Clear existing profiles
    fetchAndDisplayEmployeeDetails(sortedEmpIds);
    fetchAttendanceDetails(sortedEmpIds);
  }
}

document
  .getElementById("resetBtn")
  .addEventListener("click", fetchAllEmployees);
  document.getElementById("log-out-button").addEventListener("click", async () => {
    try {
      const auth = getAuth(); // Get the Auth instance
      await signOut(auth); // Use the signOut function
      console.log('User signed out successfully');
      window.location.href = "../../login/adminlogin.html";
      // Redirect or handle post-logout actions as needed
    } catch (error) {
      console.error('Error signing out:', error);
    }
  });
  