let trips = JSON.parse(localStorage.getItem("trips")) || [];

const tripForm = document.getElementById("tripForm");
const tripTable = document.querySelector("#tripTable tbody");

const weightLoaded = document.getElementById("weightLoaded");
const weightDelivered = document.getElementById("weightDelivered");

const ratePerTon = document.getElementById("ratePerTon");
const freightAmountField = document.getElementById("freightAmount");

const shortageRate = document.getElementById("shortageRate");
const shortageField = document.getElementById("shortage");
const shortageAmountField = document.getElementById("shortageAmount");



/* SHORTAGE CALCULATION */

function calculateShortage(){

let loaded = parseFloat(weightLoaded.value) || 0;
let delivered = parseFloat(weightDelivered.value) || 0;
let rate = parseFloat(shortageRate.value) || 0;

let shortage = loaded - delivered;

if(shortage < 0){
shortage = 0;
}

let shortageAmount = shortage * rate;

shortageField.value = shortage.toFixed(2);
shortageAmountField.value = shortageAmount.toFixed(2);

}



/* FREIGHT CALCULATION */

function calculateFreight(){

let delivered = parseFloat(weightDelivered.value) || 0;
let rate = parseFloat(ratePerTon.value) || 0;

let freight = delivered * rate;

freightAmountField.value = freight.toFixed(2);

}



/* LIVE CALCULATION EVENTS */

weightLoaded.addEventListener("input", calculateShortage);
weightDelivered.addEventListener("input", calculateShortage);
shortageRate.addEventListener("input", calculateShortage);

weightDelivered.addEventListener("input", calculateFreight);
ratePerTon.addEventListener("input", calculateFreight);



/* ADD TRIP */

tripForm.addEventListener("submit", function(e){

e.preventDefault();

let trip = {

loadingDate: document.getElementById("loadingDate").value,
unloadingDate: document.getElementById("unloadingDate").value,
transporter: document.getElementById("transporter").value,
truck: document.getElementById("truckNumber").value,
loading: document.getElementById("loadingPoint").value,
unloading: document.getElementById("unloadingPoint").value,

loaded: parseFloat(weightLoaded.value) || 0,
delivered: parseFloat(weightDelivered.value) || 0,

freight: parseFloat(freightAmountField.value) || 0,

shortage: parseFloat(shortageField.value) || 0,
shortageRate: parseFloat(shortageRate.value) || 0,
shortageAmount: parseFloat(shortageAmountField.value) || 0,

diesel: parseFloat(document.getElementById("diesel").value) || 0,
driver: parseFloat(document.getElementById("driver").value) || 0,

payment:false

};

trip.totalExpense = trip.diesel + trip.driver + trip.shortageAmount;

trips.push(trip);

localStorage.setItem("trips",JSON.stringify(trips));

renderTable();

tripForm.reset();

shortageField.value="";
shortageAmountField.value="";
freightAmountField.value="";

});



/* RENDER MAIN TABLE */

function renderTable(){

tripTable.innerHTML="";

trips.forEach((trip,index)=>{

let row = `<tr>

<td>${trip.loadingDate}</td>
<td>${trip.unloadingDate}</td>
<td>${trip.transporter}</td>
<td>${trip.truck}</td>
<td>${trip.loading}</td>
<td>${trip.unloading}</td>

<td>${trip.loaded}</td>
<td>${trip.delivered}</td>

<td>${trip.shortage}</td>
<td>${trip.freight}</td>

<td>${trip.shortageAmount}</td>

<td>${trip.diesel}</td>
<td>${trip.driver}</td>

<td>${trip.totalExpense}</td>

<td>
<input type="checkbox"
${trip.payment ? "checked":""}
onchange="togglePayment(${index})">
</td>

</tr>`;

tripTable.innerHTML += row;

});

renderReceivedTable();
renderDueTable();

}



/* PAYMENT TOGGLE */

function togglePayment(index){

trips[index].payment = !trips[index].payment;

localStorage.setItem("trips",JSON.stringify(trips));

renderTable();

}



/* RECEIVED PAYMENTS TABLE */

function renderReceivedTable(){

let table = document.querySelector("#receivedTable tbody");

table.innerHTML="";

trips.forEach(trip=>{

if(trip.payment){

let row = `<tr>

<td>${trip.truck}</td>
<td>${trip.loading} → ${trip.unloading}</td>
<td>${trip.freight}</td>

</tr>`;

table.innerHTML += row;

}

});

}



/* DUE PAYMENTS TABLE */

function renderDueTable(){

let table = document.querySelector("#dueTable tbody");

table.innerHTML="";

trips.forEach(trip=>{

if(!trip.payment){

let row = `<tr>

<td>${trip.truck}</td>
<td>${trip.loading} → ${trip.unloading}</td>
<td>${trip.freight}</td>

</tr>`;

table.innerHTML += row;

}

});

}



/* SECTION SWITCH */

function showSection(section){

document.getElementById("addTrip").style.display="none";
document.getElementById("tripData").style.display="none";
document.getElementById("received").style.display="none";
document.getElementById("due").style.display="none";

document.getElementById(section).style.display="block";

}



/* CSV DOWNLOAD */

function downloadExcel(){

if(trips.length === 0){
alert("No data to export");
return;
}

let headers = [
"Loading Date",
"Unloading Date",
"Transporter",
"Vehicle",
"Loading",
"Unloading",
"Loaded",
"Delivered",
"Shortage",
"Freight",
"Shortage Amount",
"Diesel",
"Driver",
"Total Expense",
"Payment"
];

let rows = trips.map(trip => [

trip.loadingDate,
trip.unloadingDate,
trip.transporter,
trip.truck,
trip.loading,
trip.unloading,
trip.loaded,
trip.delivered,
trip.shortage,
trip.freight,
trip.shortageAmount,
trip.diesel,
trip.driver,
trip.totalExpense,
trip.payment ? "Received":"Due"

]);

let csvContent =
[headers,...rows]
.map(e => e.join(","))
.join("\n");

let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

let link = document.createElement("a");

link.href = URL.createObjectURL(blob);
link.download = "TransportTrips.csv";

link.click();

}



/* RESET DATA */

function resetAllData(){

let confirmReset = confirm("Delete all trip data?");

if(confirmReset){

localStorage.removeItem("trips");

trips = [];

renderTable();

}

}



/* INITIAL LOAD */

renderTable();
