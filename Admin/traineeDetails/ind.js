
const profileContainer = document.getElementById('profileContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');

const scrollLeftBtn = document.getElementById('scrollLeftBtn');
const scrollRightBtn = document.getElementById('scrollRightBtn');
const attendanceTable = document.getElementById('attendance-table');

// Scroll functionality for profile cards
scrollLeftBtn.addEventListener('click', () => {
    profileContainer.scrollBy({ left: -160, behavior: 'smooth' });
});

scrollRightBtn.addEventListener('click', () => {
    profileContainer.scrollBy({ left: 160, behavior: 'smooth' });
});

// Function to create profile card
function createProfileCard(name, emp_id) {
    const card = document.createElement('div');
    card.classList.add('profile-card');

    card.innerHTML = `
        <div class="profile-card-inner">
            <div class="profile-card-front">
                <img id="prof-img" src="https://via.placeholder.com/60" alt="Profile Image">
                <h4>${name}</h4>
                <p>ID: ${emp_id}</p>
            </div>
            <div class="profile-card-back">
                <h4>${name}</h4>
                <button class="btn btn-primary" onclick="showModal('${emp_id}')">View Profile</button>
            </div>
        </div>
    `;

    return card;
}

// Function to display profile cards
async function displayProfileCards() {
    const q = query(collection(db, "employees"), orderBy("name"));

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const card = createProfileCard(data.name, data.emp_id);
        profileContainer.appendChild(card);
    });
}

// Show modal function
function showModal(emp_id) {
    $('#profileModal').modal('show');

    // Add event listeners to modal buttons
    document.getElementById('dailyAttendanceBtn').onclick = () => navigateToPage('dailyAttendance', emp_id);
    document.getElementById('monthlyAttendanceBtn').onclick = () => navigateToPage('monthlyAtt.html', emp_id);
    document.getElementById('lossOfPayBtn').onclick = () => navigateToPage('lossOfPay', emp_id);
    document.getElementById('profileBtn').onclick = () => navigateToPage('profile', emp_id);
}

// Navigation function
function navigateToPage(page, emp_id) {
    window.location.href = `${page}?emp_id=${emp_id}`;
}

// Search functionality
searchBtn.addEventListener('click', async () => {
    const searchValue = searchInput.value.trim().toLowerCase();

    if (!searchValue) {
        errorMessage.textContent = 'Please enter a name';
        return;
    }

    const q = query(collection(db, "employees"), where("name", "==", searchValue));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        errorMessage.textContent = 'Trainee does not exist';
    } else {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Navigate to the profile page
            window.location.href = `profile.html?emp_id=${data.emp_id}`;
        });
    }
});

// Display initial profile cards
displayProfileCards();

// Fetch and display attendance records
async function displayAttendanceRecords() {
    const q = query(collection(db, "attendance"), orderBy("date"));

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${data.emp_id}</td>
            <td>${data.date}</td>
            <td>${data.loginTime}</td>
            <td>${data.logoutTime}</td>
        `;

        attendanceTable.appendChild(row);
    });
}

displayAttendanceRecords();
