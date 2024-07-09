import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbS26iUhURdNCJQWvZSfLQW5XX6qVfj1w",
  authDomain: "logxp-f9b12.firebaseapp.com",
  projectId: "logxp-f9b12",
  storageBucket: "logxp-f9b12.appspot.com",
  messagingSenderId: "458817835971",
  appId: "1:458817835971:web:7ed4a7577d655796cf2376",
  measurementId: "G-J87HRDQ3F3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("month").addEventListener("change", showTable);
  document.getElementById("year").addEventListener("change", showTable);
});

async function fetchRankingData(month, year) {
  const rankingBody = document.getElementById("rankingBody");
  rankingBody.innerHTML = ""; // Clear the table body

  try {
    // Create a query to filter by month and year
    const q = query(
      collection(db, "attendance_ranking"),
      where("month", "==", month),
      where("year", "==", year)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => doc.data());
    if (snapshot.empty) {
      rankingBody.innerHTML = '<tr><td colspan="4">No Records Found</td></tr>';
      return;
    }
    // Sort by total_points
    data.sort((a, b) => b.total_points - a.total_points);

    data.forEach((doc, index) => {
      const row = document.createElement("tr");

      // Add class based on total_points
      if (doc.total_points > 20) {
        row.classList.add("high-score");
      } else if (doc.total_points >= 11 && doc.total_points <= 20) {
        row.classList.add("medium-score");
      } else {
        row.classList.add("low-score");
      }

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
  const month = document.getElementById("month").value;
  const year = document.getElementById("year").value;
  const tableDiv = document.getElementById("rankingTable");

  if (month && year) {
    tableDiv.classList.remove("hidden");
    fetchRankingData(month, year);
  }
  // else {
  //     tableDiv.classList.add('hidden');
  // }
}