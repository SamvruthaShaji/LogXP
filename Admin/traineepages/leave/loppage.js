// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5tbpKUlx1BoJnxyHOibP7T_uymsYBXA0",
    authDomain: "logxp-31c62.firebaseapp.com",
    projectId: "logxp-31c62",
    storageBucket: "logxp-31c62.appspot.com",
    messagingSenderId: "17276012238",
    appId: "1:17276012238:web:464030eb3b2062bb55729f",
    measurementId: "G-FVZH4VFV6T",
  };
  
  // Check if Firebase has already been initialized
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app(); // if already initialized, use that one
  }
  
  const db = firebase.firestore();
  
  document.addEventListener('DOMContentLoaded', () => {
    const monthDropdown = document.getElementById('lop-month');
    const yearDropdown = document.getElementById('lop-year');
    const currentYear = new Date().getFullYear();
  
    // Add month options
    for (let i = 0; i < 12; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = new Date(0, i).toLocaleString('default', { month: 'long' });
      monthDropdown.appendChild(option);
    }
  
    // Add year options
    for (let i = 2000; i <= currentYear; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      yearDropdown.appendChild(option);
    }
  
    // Set default values
    monthDropdown.value = new Date().getMonth();
    yearDropdown.value = new Date().getFullYear();
  
    updateLopData();
  
    monthDropdown.addEventListener('change', updateLopData);
    yearDropdown.addEventListener('change', updateLopData);
  });
  
  function generateCalendar(year, month) {
    const calendarBody = document.querySelector('#lop-calendar tbody');
    calendarBody.innerHTML = '';
  
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows = Math.ceil((daysInMonth + firstDay) / 7);
  
    let day = 1;
  
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement('td');
        if ((i === 0 && j < firstDay) || day > daysInMonth) {
          row.appendChild(cell);
        } else {
          cell.textContent = day;
          cell.classList.add('day-cell');
          cell.dataset.date = `${year}-${month + 1}-${day}`;
          row.appendChild(cell);
          day++;
        }
      }
      calendarBody.appendChild(row);
    }
  }
  
  function updateLopData() {
    const monthDropdown = document.getElementById('lop-month');
    const yearDropdown = document.getElementById('lop-year');
    const year = yearDropdown.value;
    const month = monthDropdown.value;
  
    document.getElementById('lop-calendar-title').textContent = `${monthDropdown.options[month].text} ${year}`;
  
    generateCalendar(Number(year), Number(month));
  
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
  
    let totalPaidDays = 0;
    let fullLopDays = 0;
    let halfLopDays = 0;
  
    // Calculate total paid days excluding weekends
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalPaidDays++;
      }
    }
  
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
                const empId = employee.emp_id; // Assuming the employee document has emp_id field
  
                db.collection('leave_details')
                  .where('leave_date', '>=', firstDayOfMonth)
                  .where('leave_date', '<=', lastDayOfMonth)
                  .where('emp_id', '==', empId)
                  .get()
                  .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                      const data = doc.data();
                      const leaveDate = data.leave_date.toDate();
                      const dateCell = document.querySelector(`.day-cell[data-date="${leaveDate.getFullYear()}-${leaveDate.getMonth() + 1}-${leaveDate.getDate()}"]`);
  
                      if (dateCell) {
                        if (data.remark === 'LOP') {
                          dateCell.classList.add('lop-full-lop');
                          fullLopDays++;
                          totalPaidDays--; // Decrement for LOP
                        } else if (data.remark === 'Half_LOP') {
                          dateCell.classList.add('lop-half-lop');
                          halfLopDays++;
                          totalPaidDays -= 0.5; // Decrement for Half LOP
                        }
                      }
                    });
  
                    document.getElementById('total-paid-days').textContent = `Total Paid Days: ${totalPaidDays}`;
                    document.getElementById('full-lop-days').textContent = `Full LOP Days: ${fullLopDays}`;
                    document.getElementById('half-lop-days').textContent = `Half LOP Days: ${halfLopDays}`;
                  })
                  .catch(error => {
                    console.error('Error fetching LOP data:', error);
                  });
  
              });
            } else {
              console.log("No matching documents.");
            }
          })
          .catch((error) => {
            console.log("Error getting documents: ", error);
          });
      } else {
        window.location.href = "../login/traineelogin.html";
      }
    });
  }
  