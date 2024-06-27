function navigateTo(page) {
    var contentDiv = document.querySelector('.content');
    // Check if the page content is already loaded
    if (contentDiv && contentDiv.dataset.page === page) {
        // Content already loaded, do nothing
        return;
    }
    // Fetch the content from external HTML files
    fetch("pages/".concat(page, ".html"))
        .then(function (response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
        .then(function (html) {
        // Store the page name as a data attribute for comparison
        if (contentDiv) {
            contentDiv.innerHTML = html;
            contentDiv.dataset.page = page; // Store current page
        }
    })
        .catch(function (error) {
        console.error('Error fetching page:', error);
        // Display an error message or handle gracefully
        if (contentDiv) {
            contentDiv.innerHTML = "<h2>Error Loading Page</h2><p>Failed to load '".concat(page, "'. Please try again later.</p>");
            contentDiv.dataset.page = ''; // Clear page data attribute
        }
    });
}
document.addEventListener('DOMContentLoaded', function () {
    // Set 'daily-attendance' as the default active page
    navigateTo('daily-attendance');
    var sidebarLinks = document.querySelectorAll('.sidebar ul li a');
    sidebarLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            var page = event.target.getAttribute('data-page');
            if (page) {
                navigateTo(page);
            }
        });
    });
    var burgerMenu = document.querySelector('.burger-menu');
    var sidebar = document.querySelector('.sidebar');
    if (burgerMenu && sidebar) {
        burgerMenu.addEventListener('click', function () {
            sidebar.classList.toggle('open');
        });
    }
});
