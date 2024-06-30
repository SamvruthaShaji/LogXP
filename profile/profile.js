// Chart.js data and configurations
const attendanceChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [{
      label: 'Attendance',
      data: [90, 70, 95, 90, 80, 80],
      backgroundColor: [
        'rgba(54, 162, 235, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(54, 162, 235, 0.2)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(54, 162, 235, 1)'
      ],
      borderWidth: 1
    },
    {
      label: 'Absent',
      data: [10, 30, 5, 10, 20, 20],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 99, 132, 0.2)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };
  const attendanceChartConfig = {
    type: 'bar',
    data: attendanceChartData,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
  
  const attendancePieChartData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      label: 'Attendance',
      data: [99, 21],
      backgroundColor: [
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 99, 132, 0.2)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };
  const attendancePieChartConfig = {
    type: 'doughnut',
    data: attendancePieChartData,
    options: {}
  };
  
  // Create Chart.js instances
  const attendanceChartCanvas = document.getElementById('attendanceChart');
  const attendanceChart = new Chart(attendanceChartCanvas, attendanceChartConfig);
  
  const attendancePieChartCanvas = document.getElementById('attendancePieChart');
  const attendancePieChart = new Chart(attendancePieChartCanvas, attendancePieChartConfig);
  
  // Update attendance data
  document.getElementById('totalDays').textContent = 120;
  document.getElementById('presentDays').textContent = 99;
  document.getElementById('absentDays').textContent = 21;
  document.getElementById('overallPercentage').textContent = 82.6; // Update overall percentage