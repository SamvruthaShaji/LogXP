document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('lop-month');
    const yearSelect = document.getElementById('lop-year');
    const calendarTitle = document.getElementById('lop-calendar-title');
    const calendarBody = document.querySelector('#lop-calendar tbody');
 
    monthSelect.addEventListener('change', updateCalendar);
    yearSelect.addEventListener('change', updateCalendar);
 
    function updateCalendar() {
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);
 
        calendarTitle.textContent = `${monthSelect.options[month].text} ${year}`;
        generateCalendar(month, year);
    }
 
    function generateCalendar(month, year) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = new Date(year, month, 1).getDay();
 
        let day = 1;
        let html = '';
 
        for (let i = 0; i < 6; i++) {
            let row = '<tr>';
 
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < (startDay === 0 ? 6 : startDay - 1)) {
                    row += '<td></td>';
                } else if (day > daysInMonth) {
                    break;
                } else {
                    const classes = [];
                    if (j === 6) classes.push('lop-sunday');
                    if (month === 4 && day === 17) classes.push('lop-half-lop');
                    if (month === 4 && day === 18) classes.push('lop-full-lop');
                    row += `<td class="${classes.join(' ')}">${day}</td>`;
                    day++;
                }
            }
 
            row += '</tr>';
            html += row;
 
            if (day > daysInMonth) break;
        }
 
        calendarBody.innerHTML = html;
    }
 
    // Initialize the calendar with the current month and year
    const now = new Date();
    monthSelect.value = now.getMonth();
    yearSelect.value = now.getFullYear();
    updateCalendar();
});