// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Populate the year and month dropdowns
document.addEventListener('DOMContentLoaded', () => {
  const yearSelect = document.getElementById('year');
  const monthSelect = document.getElementById('month');

  const currentYear = new Date().getFullYear();
  for (let year = 2010; year <= currentYear; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  const months = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ];
  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = month; // Use month names directly
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  yearSelect.addEventListener('change', fetchRankingData);
  monthSelect.addEventListener('change', fetchRankingData);
});

// Fetch and display the ranking data
async function fetchRankingData() {
  const year = document.getElementById('year').value;
  const month = document.getElementById('month').value;

  if (year && month) {
    const rankingTable = document.getElementById('rankingTable');
    const rankingBody = document.getElementById('rankingBody');

    const q = query(
      collection(db, "attendance_ranking"),
      where("year", "==", Number(year)), // Ensure year is treated as a number
      where("month", "==", month),
      orderBy("total_points", "desc") // Order by total_points
    );

    const querySnapshot = await getDocs(q);
    rankingBody.innerHTML = ''; // Clear previous results

    if (querySnapshot.empty) {
      const row = document.createElement('tr');
      const noDataCell = document.createElement('td');
      noDataCell.colSpan = 4;
      noDataCell.textContent = "No records found";
      row.appendChild(noDataCell);
      rankingBody.appendChild(row);
    } else {
      let rank = 1;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement('tr');

        // Apply conditional styling based on total_points
        if (data.total_points < 10) {
          row.classList.add('low-points');
        } else if (data.total_points >= 10 && data.total_points <= 20) {
          row.classList.add('medium-points');
        } else {
          row.classList.add('high-points');
        }

        const rankCell = document.createElement('td');
        rankCell.textContent = rank++;
        row.appendChild(rankCell);

        const empIdCell = document.createElement('td');
        empIdCell.textContent = data.emp_id;
        row.appendChild(empIdCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = data.emp_name;
        row.appendChild(nameCell);

        const totalCell = document.createElement('td');
        totalCell.textContent = data.total_points;
        row.appendChild(totalCell);

        rankingBody.appendChild(row);
      });
    }

    rankingTable.classList.remove('hidden');
  }
}
