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
  const monthDropdown = document.getElementById('month');
  const yearDropdown = document.getElementById('year');

  // Populate month dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = month;
    option.textContent = month;
    monthDropdown.appendChild(option);
  });

  // Populate year dropdown
  const currentYear = new Date().getFullYear();
  for (let year = 2000; year <= currentYear + 5; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearDropdown.appendChild(option);
  }

  // Add event listeners to dropdowns
  monthDropdown.addEventListener('change', fetchRankingData);
  yearDropdown.addEventListener('change', fetchRankingData);
});

function fetchRankingData() {
  const month = document.getElementById('month').value;
  const year = document.getElementById('year').value;

  if (!month || !year) return;

  db.collection('attendance_ranking')
    .where('month', '==', month)
    .where('year', '==', parseInt(year))
    .orderBy('total_points', 'desc')
    .get()
    .then(querySnapshot => {
      const rankingBody = document.getElementById('rankingBody');
      rankingBody.innerHTML = '';

      let rank = 1;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const row = document.createElement('tr');

        const rankCell = document.createElement('td');
        rankCell.textContent = rank;
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
        rank++;
      });

      document.getElementById('rankingTable').classList.remove('hidden');
    })
    .catch(error => {
      console.error('Error fetching ranking data:', error);
    });
}
