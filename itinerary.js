const { ipcRenderer } = required('electron');

const title = document.getElementById('title');
const dateInput = document.getElementById('dateInput');
const planInput = document.getElementById('planInput');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const viewBtn = document.getElementById('viewItinerariesBtn');
const itineraryList = document.getElementById('itineraryList');

let selectedCountry = '';
let editingId = null;

ipcRenderer.on('country-selected', (event, country) => {
    selectedCountry = country;
    title.textContent = `Create Itinerary for ${country}`;
});

saveBtn.addEventListener('click', () => {
    const date = dateInput.value;
    const plan = planInput.value.trim();
    
    if (!date || !plan) {
        alert('Please fill in both date and plan');
        return;
    }
    
    if (!selectedCountry) {
        alert('No country selected. Please go back and search for a city first');
        return;
    }
    
    const itineraryData = {
        country: selectedCountry,
        date: date,
        plan: plan
    };
    
    if (editingId) {
        itineraryData.id = editingId;
        ipcRenderer.send('update-itinerary', itineraryData);
    } else {
        ipcRenderer.send('save-itinerary', itineraryData);
    }
});

ipcRenderer.on('save-complete', (event, message) => {
    alert(message);
    clearForm();
    loadItineraries();
});

ipcRenderer.on('update-complete', (event, message) => {
    alert(message);
    clearForm();
    editingId = null;
    loadItineraries();
});

clearBtn.addEventListener('click', () => {
    clearForm();
});

function clearForm() {
    dateInput.value = '';
    planInput.value = '';
    editingId = null;
    saveBtn.textContent = 'Save Itinerary';
}

viewBtn.addEventListener('click', () => {
    loadItineraries();
});

async function loadItineraries() {
    const itineraries = await ipcRenderer.invoke('load-itineraries');
    
    itineraryList.innerHTML = '';
    
    if (itineraries.length === 0) {
        itineraryList.innerHTML = '<p class="placeholder">No itineraries saved yet</p>';
        return;
    }
    
    itineraries.reverse().forEach((item) => {
        const itineraryDiv = document.createElement('div');
        itineraryDiv.className = 'itinerary-item';
        itineraryDiv.innerHTML = `
            <h3>${item.country}</h3>
            <p><strong>Date:</strong> ${formatDate(item.date)}</p>
            <p><strong>Plan:</strong> ${item.plan}</p>
            <div class="itinerary-actions">
                <button class="edit-btn" data-id="${item.id}">Edit</button>
                <button class="delete-btn" data-id="${item.id}">Delete</button>
            </div>
        `;
        
        itineraryList.appendChild(itineraryDiv);
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            editItinerary(id, itineraries);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            deleteItinerary(id);
        });
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function editItinerary(id, itineraries) {
    const itinerary = itineraries.find(item => item.id === id);
    if (itinerary) {
        dateInput.value = itinerary.date;
        planInput.value = itinerary.plan;
        selectedCountry = itinerary.country;
        editingId = id;
        saveBtn.textContent = 'Update Itinerary';
        title.textContent = `Edit Itinerary for ${itinerary.country}`;
        
        document.querySelector('.itinerary-form').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteItinerary(id) {
    if (confirm('Are you sure you want to delete this itinerary?')) {
        ipcRenderer.send('delete-itinerary', id);
    }
}

ipcRenderer.on('delete-complete', (event, message) => {
    alert(message);
    loadItineraries();
});

window.addEventListener('load', () => {
    loadItineraries();
});