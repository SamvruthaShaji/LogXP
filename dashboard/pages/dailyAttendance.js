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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', (event) => {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const email = user.email;
            db.collection('employee_details').where('email', '==', email).get()
                .then(querySnapshot => {
                    if (!querySnapshot.empty) {
                        querySnapshot.forEach(doc => {
                            const employee = doc.data();
                            const empId = employee.emp_id;
                            document.getElementById('profile-pic').src = employee.profile_pic;
                            document.getElementById('profile-name').innerText = `Hi ${employee.emp_name}`;

                            // Fetch attendance data for the employee
                            fetchAttendanceData(empId);

                            // Fetch today's in-out details for the employee
                            fetchTodayDetails(empId);
                        });
                    } else {
                        console.log('No matching documents.');
                    }
                })
                .catch(error => {
                    console.log('Error getting documents: ', error);
                });
        } else {
            window.location.href = 'login.html';
        }
    });

    // Add event listeners for dropdown changes
    document.getElementById('dateDropdown').addEventListener('change', updateGraphs);
    document.getElementById('monthDropdown').addEventListener('change', updateGraphs);
    document.getElementById('yearDropdown').addEventListener('change', updateGraphs);
});

function fetchAttendanceData(empId) {
    db.collection('attendance_register').where('emp_id', '==', empId).get()
        .then(querySnapshot => {
            if (!querySnapshot.empty) {
                let attendanceHTML = '';
                querySnapshot.forEach(doc => {
                    const attendance = doc.data();
                    const date = attendance.date.toDate().toLocaleDateString();
                    const status = attendance.attendance_status === 'p' ? 'Present' : 'Absent';

                    attendanceHTML += `
                        <div class="time-slots">
                            <div class="slot ${status === 'Present' ? 'green' : 'red'}">
                                ${date} - ${status}
                            </div>
                        </div>
                    `;
                });
                document.querySelector('.DA .main-content').innerHTML += attendanceHTML;
            } else {
                console.log('No attendance records found.');
            }
        })
        .catch(error => {
            console.log('Error getting documents: ', error);
        });
}

function fetchTodayDetails(empId) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    db.collection('in_out_details').where('emp_id', '==', empId)
        .where('timestamp', '>=', startOfDay)
        .where('timestamp', '<=', endOfDay)
        .get()
        .then(querySnapshot => {
            if (!querySnapshot.empty) {
                querySnapshot.forEach(doc => {
                    const details = doc.data();
                    // Update the UI with today's in-out details
                    console.log('Today\'s details: ', details);
                });
            } else {
                console.log('No in-out details found for today.');
            }
        })
        .catch(error => {
            console.log('Error getting today\'s details: ', error);
        });
}

function updateGraphs() {
    const selectedDate = document.getElementById('dateDropdown').value;
    const selectedMonth = document.getElementById('monthDropdown').value;
    const selectedYear = document.getElementById('yearDropdown').value;

    // Construct a date object from the selected values
    const selectedDateObj = new Date(`${selectedYear}-${selectedMonth}-${selectedDate}`);

    // Fetch data from in_out_details collection based on the selected date
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const email = user.email;
            db.collection('employee_details').where('email', '==', email).get()
                .then(querySnapshot => {
                    if (!querySnapshot.empty) {
                        querySnapshot.forEach(doc => {
                            const employee = doc.data();
                            const empId = employee.emp_id;

                            db.collection('in_out_details').where('emp_id', '==', empId)
                                .where('timestamp', '>=', selectedDateObj)
                                .where('timestamp', '<=', new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), selectedDateObj.getDate(), 23, 59, 59, 999))
                                .get()
                                .then(querySnapshot => {
                                    if (!querySnapshot.empty) {
                                        let graphData = [];
                                        querySnapshot.forEach(doc => {
                                            const details = doc.data();
                                            graphData.push(details);
                                        });

                                        // Update the graphs with the fetched data
                                        console.log('Graph data: ', graphData);
                                    } else {
                                        console.log('No in-out details found for the selected date.');
                                    }
                                })
                                .catch(error => {
                                    console.log('Error getting in-out details: ', error);
                                });
                        });
                    } else {
                        console.log('No matching documents.');
                    }
                })
                .catch(error => {
                    console.log('Error getting documents: ', error);
                });
        } else {
            window.location.href = 'login.html';
        }
    });
}
