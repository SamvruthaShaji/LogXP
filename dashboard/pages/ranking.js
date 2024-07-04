import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js";

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

async function fetchRankingData(month, year) {
    const rankingBody = document.getElementById('rankingBody');
    rankingBody.innerHTML = ''; // Clear the table body
    const defaultPoints = 30; // Default points for each employee

    console.log("Fetching ranking data for month:", month, "and year:", year);

    try {
        const attendanceSnapshot = await getDocs(collection(db, 'attendance_ranking'));
        const leaveSnapshot = await getDocs(collection(db, 'leave_details'));

        console.log("Attendance Data:", attendanceSnapshot.docs);
        console.log("Leave Data:", leaveSnapshot.docs);

        const leaveData = leaveSnapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            const leaveDate = new Date(data.leave_date.seconds * 1000); // Convert Firestore timestamp to JS Date
            if (leaveDate.getMonth() + 1 === parseInt(month) && leaveDate.getFullYear() === parseInt(year)) {
                acc[data.emp_id] = (acc[data.emp_id] || 0) + 1; // Count leaves for each employee
            }
            return acc;
        }, {});

        console.log("Leave Data Processed:", leaveData);

        const data = attendanceSnapshot.docs.map(doc => doc.data());

        // Deduct leave points and sort by adjusted total_points
        data.forEach(doc => {
            const leavesTaken = leaveData[doc.emp_id] || 0;
            doc.total_points = defaultPoints - leavesTaken;
        });

        console.log("Data after calculating total points:", data);

        data.sort((a, b) => b.total_points - a.total_points);

        data.forEach((doc, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${doc.emp_id}</td>
                <td>${doc.emp_name}</td>
                <td>${doc.total_points}</td>
            `;
            rankingBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching ranking data: ", error);
    }
}

function showTable() {
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;
    const tableDiv = document.getElementById('rankingTable');

    if (month && year) {
        tableDiv.classList.remove('hidden');
        fetchRankingData(month, year);
    } else {
        tableDiv.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('month').addEventListener('change', showTable);
    document.getElementById('year').addEventListener('change', showTable);
});