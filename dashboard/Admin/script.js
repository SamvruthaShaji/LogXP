
const profileContainer = document.getElementById('profileContainer');
const profileCardWidth = 160; // Width of profile card plus margin
let visibleCards = 4;
let scrollPosition = 0;

function updateVisibleCards() {
    if (window.innerWidth <= 768) {
        visibleCards = 2;
    } else {
        visibleCards = 4;
    }
}

function scrollLeft() {
    if (scrollPosition > 0) {
        scrollPosition -= profileCardWidth * visibleCards;
        profileContainer.style.transform = `translateX(-${scrollPosition}px)`;
    }
}

function scrollRight() {
    if (scrollPosition < profileContainer.scrollWidth - (profileCardWidth * visibleCards)) {
        scrollPosition += profileCardWidth * visibleCards;
        profileContainer.style.transform = `translateX(-${scrollPosition}px)`;
    }
}

document.getElementById('scrollLeftBtn').addEventListener('click', scrollLeft);
document.getElementById('scrollRightBtn').addEventListener('click', scrollRight);

window.addEventListener('resize', updateVisibleCards);
updateVisibleCards();

// Search functionality
function searchTrainee() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const profileCards = document.querySelectorAll('.profile-card');
    let traineeFound = false;

    profileCards.forEach(card => {
        const name = card.querySelector('h4').innerText.toLowerCase();
        if (name === searchInput) {
            const imgSrc = card.querySelector('img').src;
            const month = card.querySelector('p:nth-of-type(1)').innerText.split(': ')[1].replace('%', '');
            const total = card.querySelector('p:nth-of-type(2)').innerText.split(': ')[1].replace('%', '');
            
            // Redirect to profile page with trainee details
            window.location.href = `profile.html?name=${name}&imgSrc=${imgSrc}&month=${month}&total=${total}`;
            traineeFound = true;
        }
    });
    if (!traineeFound) {
        document.getElementById('errorMessage').innerText = 'Trainee does not exist.';
    } else {
        document.getElementById('errorMessage').innerText = '';
    }
}

// Enable or disable the search button based on input length
function toggleSearchButton() {
    const searchInput = document.getElementById('searchInput').value;
    const searchBtn = document.getElementById('searchBtn');
    if (searchInput.length >= 3) {
        searchBtn.disabled = false;
    } else {
        searchBtn.disabled = true;
    }
}

document.getElementById('searchInput').addEventListener('input', toggleSearchButton);
document.getElementById('searchBtn').addEventListener('click', searchTrainee);
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        if (!document.getElementById('searchBtn').disabled) {
            searchTrainee();
        }
    }
});

// Initialize the search button state on page load
toggleSearchButton();
