const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let itineraryWindow;

function createMainWindow() { //function to create main window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile('renderer/index.html');
}//func main window

function createItineraryWindow(country) {  //function to create itinerary window
  itineraryWindow = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  itineraryWindow.loadFile('renderer/itinerary.html');

  itineraryWindow.webContents.on('did-finish-load', () => {
    itineraryWindow.webContents.send('country-selected', country);
  });
}

ipcMain.on('open-itinerary-window', (event, country) => {
  createItineraryWindow(country);
});

ipcMain.on('save-itinerary', (event, data) => {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  
  const filePath = path.join(dataDir, 'itineraries.json');
  let itineraries = [];

  if (fs.existsSync(filePath)) {
    itineraries = JSON.parse(fs.readFileSync(filePath));
  }

  const newItinerary = {
    id: Date.now().toString(),
    ...data
  };
  
  itineraries.push(newItinerary);
  fs.writeFileSync(filePath, JSON.stringify(itineraries, null, 2));
  
  event.reply('save-complete', 'Itinerary saved successfully');
});

ipcMain.handle('load-itineraries', () => {
  const filePath = path.join(__dirname, 'data', 'itineraries.json');

  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath));
  } else {
    return [];
  }
});

ipcMain.on('delete-itinerary', (event, id) => {
  const filePath = path.join(__dirname, 'data', 'itineraries.json');

  if (fs.existsSync(filePath)) {
    let itineraries = JSON.parse(fs.readFileSync(filePath));
    itineraries = itineraries.filter(item => item.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(itineraries, null, 2));
    event.reply('delete-complete', 'Itinerary deleted successfully');
  }
});

ipcMain.on('update-itinerary', (event, updatedData) => {
  const filePath = path.join(__dirname, 'data', 'itineraries.json');

  if (fs.existsSync(filePath)) {
    let itineraries = JSON.parse(fs.readFileSync(filePath));
    const index = itineraries.findIndex(item => item.id === updatedData.id);
    if (index !== -1) {
      itineraries[index] = updatedData;
      fs.writeFileSync(filePath, JSON.stringify(itineraries, null, 2));
      event.reply('update-complete', 'Itinerary updated successfully');
    }
  }
});

app.whenReady().then(createMainWindow);  // main program

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});