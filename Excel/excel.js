import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
  const firebaseConfig = {
    apiKey: "AIzaSyCr9SwqSTwOvX2cLjAxQ_l0sS_KgAUhSMg",
    authDomain: "logxpbackup.firebaseapp.com",
    projectId: "logxpbackup",
    storageBucket: "logxpbackup.appspot.com",
    messagingSenderId: "909937540569",
    appId: "1:909937540569:web:3656e073ee72d67c52adc8"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  let JSONDATA = null;
document.getElementById('upload').addEventListener('change',handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(jsonData);
    console.log(jsonData[0].emp_id);
    displayData(jsonData);
    JSONDATA = jsonData;
    createDocument(JSONDATA);
  };

  reader.readAsArrayBuffer(file);
}
function displayData(data) {
    const outputDiv = document.createElement('div');
    outputDiv.style.whiteSpace = 'pre';
    outputDiv.textContent = JSON.stringify(data, null, 2);
    document.body.appendChild(outputDiv);
  }
  async function createDocument(json) {
    try {
        for(const data of json){
            const jsDate = excelDateToJSDate(data.timestamp);
            console.log(jsDate);
            const firebaseTimestamp = Timestamp.fromDate(jsDate);
            const docRef = await addDoc(collection(db, "in_out_details"), {
                emp_id:data.emp_id,
                status:data.status,
                timestamp:firebaseTimestamp
              });
              console.log("Document written with ID: ", docRef.id);
        }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  function excelDateToJSDate(serial) {
    const excelEpoch = new Date(1899, 11, 30); // Excel epoch starts at Dec 30, 1899
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    const jsDate = new Date(excelEpoch.getTime() + (serial - 1) * millisecondsInDay);
    
    // // Adjust for time zone difference
    // const timeZoneOffset = jsDate.getTimezoneOffset() * 60 * 1000; // Offset in milliseconds
    // const adjustedDate = new Date(jsDate.getTime() + timeZoneOffset);
    
    return jsDate;
  }