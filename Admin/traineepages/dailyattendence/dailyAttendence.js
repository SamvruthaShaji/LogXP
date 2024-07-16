// Function to format date as YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
  
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
  
    return [year, month, day].join('-');
  }
  
  // Display today's date
  const today = new Date();
  document.getElementById("today-date").innerText = formatDate(today);
  
  // Fetch and display attendance for a specific date
  function fetchAttendance(date, empId, isToday = false) {
    const formattedDate = formatDate(date);
    const attendanceTable = isToday ? document.getElementById("attendance-today") : document.getElementById("attendance-details");
    const totalHoursElem = isToday ? document.getElementById("total-hours-today") : document.getElementById("total-hours");
    const firstLoginTimeElem = isToday ? document.getElementById("first-login-time-today") : document.getElementById("first-login-time");
    const lastLogoutTimeElem = isToday ? document.getElementById("last-logout-time-today") : document.getElementById("last-logout-time");
  
    attendanceTable.innerHTML = ""; // Clear previous data
    totalHoursElem.innerText = "";
    firstLoginTimeElem.innerText = "";
    lastLogoutTimeElem.innerText = "";
  
    const table = document.createElement("table");
    table.className = "attendance-table";
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
  
    const headerRow = document.createElement("tr");
    const inTimeHeader = document.createElement("th");
    inTimeHeader.innerText = "In Time";
    const outTimeHeader = document.createElement("th");
    outTimeHeader.innerText = "Out Time";
    headerRow.appendChild(inTimeHeader);
    headerRow.appendChild(outTimeHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    table.appendChild(tbody);
    attendanceTable.appendChild(table);
  
    db.collection("in_out_details")
      .where("emp_id", "==", empId)
      .where("timestamp", ">=", new Date(`${formattedDate}T00:00:00`))
      .where("timestamp", "<=", new Date(`${formattedDate}T23:59:59`))
      .orderBy("timestamp")
      .get()
      .then((querySnapshot) => {
        let firstLogin = null;
        let lastLogout = null;
        let lastStatus = null;
        let lastTimestamp = null;
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp.toDate();
          
          if (data.status === 1 && !firstLogin) {
            firstLogin = timestamp;
          }
          if (data.status === 2) {
            lastLogout = timestamp;
          }
  
          if (lastStatus === 1 && data.status === 2) {
            const row = document.createElement("tr");
            const inTimeCell = document.createElement("td");
            const outTimeCell = document.createElement("td");
            inTimeCell.innerText = lastTimestamp.toLocaleTimeString();
            outTimeCell.innerText = timestamp.toLocaleTimeString();
            row.appendChild(inTimeCell);
            row.appendChild(outTimeCell);
            tbody.appendChild(row);
          }
  
          lastStatus = data.status;
          lastTimestamp = timestamp;
        });
  
        if (firstLogin && lastLogout) {
          const totalTime = (lastLogout - firstLogin) / 1000 / 60 / 60;
          totalHoursElem.innerText = `Total Hours: ${totalTime.toFixed(2)}`;
          firstLoginTimeElem.innerText = `First Login: ${firstLogin.toLocaleTimeString()}`;
          lastLogoutTimeElem.innerText = `Last Logout: ${lastLogout.toLocaleTimeString()}`;
        }
      })
      .catch((error) => {
        console.error("Error fetching attendance: ", error);
      });
  }
  
  // Date picker functionality
  document.getElementById("submit-button").addEventListener("click", () => {
    const selectedDate = new Date(document.getElementById("date-picker").value);
    const user = firebase.auth().currentUser;
  
    if (user) {
      const email = user.email;
      db.collection("employee_details")
        .where("email", "==", email)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const employee = doc.data();
              document.getElementById("selected-date").innerText = formatDate(selectedDate);
              document.getElementById("attendance-specific-date").style.display = "block";
              fetchAttendance(selectedDate, employee.emp_id);
            });
          } else {
            console.log("No matching documents.");
          }
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    }
  });
  
  // Initialize today's attendance
  document.addEventListener("DOMContentLoaded", (event) => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        const email = user.email;
        db.collection("employee_details")
          .where("email", "==", email)
          .get()
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              querySnapshot.forEach((doc) => {
                const employee = doc.data();
                fetchAttendance(today, employee.emp_id, true);
              });
            } else {
              console.log("No matching documents.");
            }
          })
          .catch((error) => {
            console.log("Error getting documents: ", error);
          });
      }
    });
  });
  