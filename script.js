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
const dieselField = document.getElementById("diesel");
const driverField = document.getElementById("driver");

// --- Shortage Calculation ---
function calculateShortage(){
    let loaded = parseFloat(weightLoaded.value) || 0;
    let delivered = parseFloat(weightDelivered.value) || 0;
    let rate = parseFloat(shortageRate.value) || 0;

    let shortage = loaded - delivered;
    if(shortage < 0) shortage = 0;

    let shortageAmount = shortage * rate;

    shortageField.value = shortage.toFixed(2);
    shortageAmountField.value = shortageAmount.toFixed(2);
}

// --- Freight Calculation ---
function calculateFreight(){
    let delivered = parseFloat(weightDelivered.value) || 0;
    let rate = parseFloat(ratePerTon.value) || 0;

    let freight = delivered * rate;
    freightAmountField.value = freight.toFixed(2);
}

// --- Live Calculation Events ---
weightLoaded.addEventListener("input", calculateShortage);
weightDelivered.addEventListener("input", () => { calculateShortage(); calculateFreight(); });
shortageRate.addEventListener("input", calculateShortage);
ratePerTon.addEventListener("input", calculateFreight);

// --- Add Trip ---
tripForm.addEventListener("submit", function(e){
    e.preventDefault();

    // ensure calculations are up-to-date
    calculateShortage();
    calculateFreight();

    let diesel = parseFloat(dieselField.value) || 0;
    let driver = parseFloat(driverField.value) || 0;
    let shortageAmount = parseFloat(shortageAmountField.value) || 0;
    let freight = parseFloat(freightAmountField.value) || 0;

    let trip = {
        loadingDate: document.getElementById("loadingDate").value,
        unloadingDate: document.getElementById("unloadingDate").value,
        transporter: document.getElementById("transporter").value,
        truck: document.getElementById("truckNumber").value,
        loading: document.getElementById("loadingPoint").value,
        unloading: document.getElementById("unloadingPoint").value,
        loaded: parseFloat(weightLoaded.value) || 0,
        delivered: parseFloat(weightDelivered.value) || 0,
        freight: freight,
        shortage: parseFloat(shortageField.value) || 0,
        shortageRate: parseFloat(shortageRate.value) || 0,
        shortageAmount: shortageAmount,
        diesel: diesel,
        driver: driver,
        payment: false
    };

    // Total expense
    trip.totalExpense = shortageAmount + diesel + driver;

    // Net Amount = Freight - (Shortage + Diesel + Driver)
    trip.netAmount = freight - trip.totalExpense;

    trips.push(trip);
    localStorage.setItem("trips", JSON.stringify(trips));

    renderTable();
    tripForm.reset();
    shortageField.value = "";
    shortageAmountField.value = "";
    freightAmountField.value = "";
});

// --- Render Main Table ---
function renderTable(){
    tripTable.innerHTML = "";
    trips.forEach((trip, index)=>{
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
            <td>${trip.totalExpense.toFixed(2)}</td>
            <td>${trip.netAmount.toFixed(2)}</td>
            <td><input type="checkbox" ${trip.payment ? "checked":""} onchange="togglePayment(${index})"></td>
        </tr>`;
        tripTable.innerHTML += row;
    });

    renderReceivedTable();
    renderDueTable();
}

// --- Payment Toggle ---
function togglePayment(index){
    trips[index].payment = !trips[index].payment;
    localStorage.setItem("trips", JSON.stringify(trips));
    renderTable();
}

// --- Received Payments ---
function renderReceivedTable(){
    let table = document.querySelector("#receivedTable tbody");
    table.innerHTML = "";
    trips.forEach(trip=>{
        if(trip.payment){
            let row = `<tr>
                <td>${trip.truck}</td>
                <td>${trip.loading} → ${trip.unloading}</td>
                <td>${trip.netAmount.toFixed(2)}</td>
            </tr>`;
            table.innerHTML += row;
        }
    });
}

// --- Due Payments ---
function renderDueTable(){
    let table = document.querySelector("#dueTable tbody");
    table.innerHTML = "";
    trips.forEach(trip=>{
        if(!trip.payment){
            let row = `<tr>
                <td>${trip.truck}</td>
                <td>${trip.loading} → ${trip.unloading}</td>
                <td>${trip.netAmount.toFixed(2)}</td>
            </tr>`;
            table.innerHTML += row;
        }
    });
}

// --- Section Switch ---
function showSection(section){
    document.getElementById("addTrip").style.display="none";
    document.getElementById("tripData").style.display="none";
    document.getElementById("received").style.display="none";
    document.getElementById("due").style.display="none";
    document.getElementById(section).style.display="block";
}

// --- Excel Download ---
function downloadExcel(){
    if(trips.length === 0){
        alert("No data to export");
        return;
    }

    let headers = [
        "Month","Loading Date","Unloading Date","Transporter","Vehicle",
        "Loading","Unloading","Loaded","Delivered","Freight",
        "Shortage","Shortage Amount","Diesel","Driver","Total Expense","Net Amount","Payment"
    ];

    let rows = trips.map(trip=>{
        let date = new Date(trip.loadingDate);
        let month = date.toLocaleString("default",{month:"long", year:"numeric"});
        return [
            month,
            trip.loadingDate,
            trip.unloadingDate,
            trip.transporter,
            trip.truck,
            trip.loading,
            trip.unloading,
            trip.loaded,
            trip.delivered,
            trip.freight.toFixed(2),
            trip.shortage,
            trip.shortageAmount.toFixed(2),
            trip.diesel.toFixed(2),
            trip.driver.toFixed(2),
            trip.totalExpense.toFixed(2),
            trip.netAmount.toFixed(2),
            trip.payment ? "Received":"Due"
        ];
    });

    let csvContent = [headers,...rows].map(e=>e.join(",")).join("\n");

    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "TransportTrips.csv";
    link.click();
}

// --- Reset Data ---
function resetAllData(){
    if(confirm("Delete all trip data?")){
        localStorage.removeItem("trips");
        trips = [];
        renderTable();
    }
}

// --- Initial Load ---
renderTable();
