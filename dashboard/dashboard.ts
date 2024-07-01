function toggleSidebar(): void {
    const sidebar = document.querySelector('.sidebar') as HTMLElement | null;
    const content = document.querySelector('.content') as HTMLElement | null;
    const header = document.querySelector('header') as HTMLElement | null;
  
    if (sidebar && content && header) {
      if (sidebar.style.width === '250px' || sidebar.style.width === '') {
        sidebar.style.width = '0';
        content.style.marginLeft = '0';
        header.style.left = '0';
      } else {
        sidebar.style.width = '250px';
        content.style.marginLeft = '250px';
        header.style.left = '250px';
      }
    }
  }
  