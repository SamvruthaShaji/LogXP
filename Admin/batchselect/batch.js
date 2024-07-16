// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, doc, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
 
 
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5tbpKUlx1BoJnxyHOibP7T_uymsYBXA0",
    authDomain: "logxp-31c62.firebaseapp.com",
    projectId: "logxp-31c62",
    storageBucket: "logxp-31c62.appspot.com",
    messagingSenderId: "17276012238",
    appId: "1:17276012238:web:464030eb3b2062bb55729f",
    measurementId: "G-FVZH4VFV6T"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
 
function viewBatchDetails(batchId) {
    window.location.href = '/Admin/traineeDetails/index.html?batchId=' + encodeURIComponent(batchId);
// Navigate to sahir/index.html
}
function navigateToRanking() {
    window.location.href = '/Admin/Ranking/Ranking.html';
}
// Upload Data Modal Event Listeners
document.getElementById('excelbutton').addEventListener('click', () => {
    $('#uploadModal').modal('show');
});
// Function to handle file upload
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
 
let uploadedData = null;
 
function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
 
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        uploadedData = XLSX.utils.sheet_to_json(worksheet);
        console.log(uploadedData);
    };
 
    reader.readAsArrayBuffer(file);
}
 
document.getElementById('viewDataBtn').addEventListener('click', () => {
    if (uploadedData) {
        const uploadedDataDiv = document.getElementById('uploadedData');
        let tableHtml = '<table border="1"><tr>';
        // Create table headers based on keys of the first object
        const headers = Object.keys(uploadedData[0]);
        headers.forEach(header => {
            tableHtml += `<th>${header}</th>`;
        });
        tableHtml += '</tr>';
 
        // Create table rows
        uploadedData.forEach(record => {
            tableHtml += '<tr>';
            headers.forEach(header => {
                tableHtml += `<td>${record[header]}</td>`;
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</table>';
        uploadedDataDiv.innerHTML = tableHtml;
    }
});
 
document.getElementById('clearDataBtn').addEventListener('click', () => {
    document.getElementById('fileInput').value = '';
    uploadedData = null;
    document.getElementById('uploadedData').innerHTML = '';
});
 
document.getElementById('saveDataBtn').addEventListener('click', async () => {
    if (uploadedData) {
        try {
            const batch = writeBatch(db);
 
            uploadedData.forEach((record) => {
                // Extract required fields emp_id, status, timestamp
                const { emp_id, status, timestamp } = record;
 
                // Parse timestamp using moment.js
                const parsedTimestamp = moment(timestamp, 'MMMM DD, YYYY [at] hh:mm:ss A Z').toDate();
 
                // Check if parsedTimestamp is a valid Date
                if (isNaN(parsedTimestamp.getTime())) {
                    console.error('Invalid timestamp:', timestamp);
                    return; // Skip this record if timestamp is invalid
                }
 
                // Convert timestamp to Firestore Timestamp format
                const timestampFirestore = Timestamp.fromDate(parsedTimestamp);
 
                // Create a new document reference for each record
                const docRef = doc(collection(db, 'in_out_details'));
 
                // Set the document data with emp_id, status, and timestamp
                batch.set(docRef, { emp_id, status, timestamp: timestampFirestore });
            });
 
            // Commit the batch write
            await batch.commit();
            alert('Data saved successfully!');
            $('#uploadModal').modal('hide');
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data. Please try again.');
        }
    }
});
 