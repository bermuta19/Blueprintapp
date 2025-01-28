const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  sendToMain: (data) => ipcRenderer.send('request-data', data),
  onDataReceived: (callback) => ipcRenderer.on('response-data', callback),
});
