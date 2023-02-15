// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (callback) => ipcRenderer.on('open-file', callback),
  saveFile: (callback) => ipcRenderer.on('save-file', callback),
  require: (callback) => window.require(callback),
  toggleView: (callback) => ipcRenderer.on('toggle-view', callback),
  setFilePath: (filePath) => ipcRenderer.send('set-filePath', filePath)
})
