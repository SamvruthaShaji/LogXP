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
function fetchAttendance(date) {
  const formattedDate = formatDate(date);
  const attendanceBarToday = document.getElementById("attendance-today");
  const attendanceBarSpecific = document.getElementById("attendance-details");
  const totalHours = document.getElementById("total-hours");
  const firstLoginTime = document.getElementById("first-login-time");
  const lastLogoutTime = document.getElementById("last-logout-time");

  attendanceBarToday.innerHTML = ""; // Clear previous data
  attendanceBarSpecific.innerHTML = ""; // Clear previous data
  totalHours.innerText = "";
  firstLoginTime.innerText = "";
  lastLogoutTime.innerText = "";

  db.collection("in_out_details")
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
        const status = data.status === 1 ? "green" : "red";
        const timestamp = data.timestamp.toDate();
        
        // Track first login and last logout times for the day
        if (data.status === 1 && !firstLogin) {
          firstLogin = timestamp;
        }
        if (data.status === 2) {
          lastLogout = timestamp;
        }

        // Calculate duration between status changes and create bar segments
        if (lastStatus !== null && lastTimestamp !== null) {
          const duration = (timestamp - lastTimestamp) / 1000 / 60 / 60; // Duration in hours
          const barItem = document.createElement("div");
          barItem.className = `attendance-bar-item ${lastStatus}`;
          barItem.style.flexGrow = duration;
          barItem.innerText = duration.toFixed(2) + "h";
          barItem.dataset.time = lastTimestamp.toLocaleTimeString();

          // Append bar item to both today's and specific date's attendance bars
          attendanceBarToday.appendChild(barItem.cloneNode(true));
          attendanceBarSpecific.appendChild(barItem.cloneNode(true));
        }

        // Update the last status and timestamp
        lastStatus = status;
        lastTimestamp = timestamp;
      });

      // Calculate total hours if both login and logout times are available
      if (firstLogin && lastLogout) {
        const totalTime = (lastLogout - firstLogin) / 1000 / 60 / 60; // Total hours
        totalHours.innerText = `Total Hours: ${totalTime.toFixed(2)}`;
        firstLoginTime.innerText = `First Login: ${firstLogin.toLocaleTimeString()}`;
        lastLogoutTime.innerText = `Last Logout: ${lastLogout.toLocaleTimeString()}`;
      }
    })
    .catch((error) => {
      console.error("Error fetching attendance: ", error);
    });
}

// Initialize today's attendance
fetchAttendance(today);

// Date picker functionality
document.getElementById("submit-button").addEventListener("click", () => {
  const selectedDate = new Date(document.getElementById("date-picker").value);
  document.getElementById("selected-date").innerText = formatDate(selectedDate);
  document.getElementById("attendance-specific-date").style.display = "block";
  fetchAttendance(selectedDate);
});
