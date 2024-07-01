function toggleSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var content = document.querySelector('.content');
    var header = document.querySelector('header');
    if (sidebar && content && header) {
        if (sidebar.style.width === '250px' || sidebar.style.width === '') {
            sidebar.style.width = '0';
            content.style.marginLeft = '0';
            header.style.left = '0';
        }
        else {
            sidebar.style.width = '250px';
            content.style.marginLeft = '250px';
            header.style.left = '250px';
        }
    }
}
