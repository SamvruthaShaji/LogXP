// Add any necessary JavaScript functionality here, such as populating month and year options
document.addEventListener("DOMContentLoaded", function() {
    const monthSelect = document.getElementById("month");
    const yearSelect = document.getElementById("year");

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [2021, 2022, 2023, 2024, 2025];

    months.forEach(month => {
        const option = document.createElement("option");
        option.text = month;
        option.value = month;
        monthSelect.add(option);
    });

    years.forEach(year => {
        const option = document.createElement("option");
        option.text = year;
        option.value = year;
        yearSelect.add(option);
    });
});
