const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Disable node integration for security
      contextIsolation: true, // Enable context isolation
      preload: path.join(__dirname, 'preload.js'), // Load the preload script
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/pages/index.html'));
  ipcMain.on('request-data', (event, data) => {
    console.log('Received from renderer:', data);
    event.reply('response-data', { success: true, message: 'Data received in main process' });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

