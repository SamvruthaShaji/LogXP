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
  const BatchSelect = document.getElementById('Batch');

  const currentYear = new Date().getFullYear();
  for (let year = 2020; year <= currentYear; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  const Batch = [
    "All Batches", "ILPBatch 1", "ILPBatch 2", "ILPBatch 3", "ILPBatch 4", "ILPBatch 5"
  ];
  Batch.forEach((Batch) => {
    const option = document.createElement('option');
    option.value = Batch; // Use month names directly
    option.textContent = Batch;
    BatchSelect.appendChild(option);
  });

  // Set initial values to show all batches of 2024
  yearSelect.value = "2024";
  BatchSelect.value = "All Batches";

  // Fetch and display the initial data
  fetchRankingData();

  yearSelect.addEventListener('change', fetchRankingData);
  BatchSelect.addEventListener('change', fetchRankingData);
});

// Fetch and display the ranking data
async function fetchRankingData() {
  const year = document.getElementById('year').value;
  const Batch = document.getElementById('Batch').value;

  if (year && Batch) {
      const rankingTable = document.getElementById('rankingTable');
      const rankingBody = document.getElementById('rankingBody');

      let q;

      if (Batch === 'All Batches') {
          q = query(
              collection(db, "attendance_ranking"),
              where("year", "==", Number(year)), // Ensure year is treated as a number
              where("Batch", "in", ["ILPBatch 1", "ILPBatch 2", "ILPBatch 3", "ILPBatch 4", "ILPBatch 5"]),
              orderBy("total_points", "desc") // Order by total_points
          );
      } else {
          q = query(
              collection(db, "attendance_ranking"),
              where("year", "==", Number(year)), // Ensure year is treated as a number
              where("Batch", "==", Batch),
              orderBy("total_points", "desc") // Order by total_points
          );
      }

      const querySnapshot = await getDocs(q);
      rankingBody.innerHTML = ''; // Clear previous results

      if (querySnapshot.empty) {
          const row = document.createElement('tr');
          const noRecordsCell = document.createElement('td');
          noRecordsCell.colSpan = 5; // Adjust based on the number of columns
          noRecordsCell.textContent = 'No records found';
          row.appendChild(noRecordsCell);
          rankingBody.appendChild(row);
      } else {
          let rank = 1;
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              const row = document.createElement('tr');

              // Determine row color based on total_points
              let rowColorClass = '';
              if (data.total_points < 10) {
                  rowColorClass = 'table-danger'; // Red color
              } else if (data.total_points >= 10 && data.total_points <= 20) {
                  rowColorClass = 'table-warning'; // Orange color
              } else {
                  rowColorClass = 'table-success'; // Green color
              }

              row.classList.add(rowColorClass); // Add Bootstrap class for row color

              const rankCell = document.createElement('td');
              rankCell.textContent = rank++;
              row.appendChild(rankCell);

              const empIdCell = document.createElement('td');
              empIdCell.textContent = data.emp_id;
              row.appendChild(empIdCell);

              const nameCell = document.createElement('td');
              nameCell.textContent = data.emp_name;
              row.appendChild(nameCell);

              const BatchCell = document.createElement('td');
              BatchCell.textContent = data.Batch;
              row.appendChild(BatchCell);

              const totalCell = document.createElement('td');
              totalCell.textContent = data.total_points;
              row.appendChild(totalCell);

              rankingBody.appendChild(row);
          });
      }

      rankingTable.classList.remove('hidden');
  }
}