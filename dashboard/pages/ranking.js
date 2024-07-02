function showTable() {
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;
    const tableDiv = document.getElementById('rankingTable');

    if (month && year) {
        tableDiv.classList.remove('hidden');
    } else {
        tableDiv.classList.add('hidden');
    }
}