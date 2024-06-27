function navigateTo(page: string) {
    const contentDiv = document.querySelector('.content') as HTMLDivElement;

    // Check if the page content is already loaded
    if (contentDiv && contentDiv.dataset.page === page) {
        // Content already loaded, do nothing
        return;
    }

    // Fetch the content from external HTML files
    fetch(`pages/${page}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // Store the page name as a data attribute for comparison
            if (contentDiv) {
                contentDiv.innerHTML = html;
                contentDiv.dataset.page = page; // Store current page
            }
        })
        .catch(error => {
            console.error('Error fetching page:', error);
            // Display an error message or handle gracefully
            if (contentDiv) {
                contentDiv.innerHTML = `<h2>Error Loading Page</h2><p>Failed to load '${page}'. Please try again later.</p>`;
                contentDiv.dataset.page = ''; // Clear page data attribute
            }
        });
}

document.addEventListener('DOMContentLoaded', () => {
    // Set 'daily-attendance' as the default active page
    navigateTo('daily-attendance');

    const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const page = (event.target as HTMLAnchorElement).getAttribute('data-page');
            if (page) {
                navigateTo(page);
            }
        });
    });

    const burgerMenu = document.querySelector('.burger-menu');
    const sidebar = document.querySelector('.sidebar');

    if (burgerMenu && sidebar) {
        burgerMenu.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
});
