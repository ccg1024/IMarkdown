// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge } = require('electron')
const ipcChannel = require('./config/backend')

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: callback => ipcRenderer.on(ipcChannel.openFileChannel, callback),
  saveFile: callback => ipcRenderer.on(ipcChannel.saveFileChannel, callback),
  require: callback => window.require(callback),
  toggleView: callback =>
    ipcRenderer.on(ipcChannel.toggleViewChannel, callback),
  setFilePath: filePath =>
    ipcRenderer.send(ipcChannel.updateFilePathChannel, filePath),
  setContentChange: isChange =>
    ipcRenderer.send(ipcChannel.setIsChangeChannel, isChange),
  showUnsavedInfo: () => ipcRenderer.send(ipcChannel.showUnsaveChannel),
  removeSaveFile: () =>
    ipcRenderer.removeAllListeners(ipcChannel.saveFileChannel),
  removeOpenFile: () =>
    ipcRenderer.removeAllListeners(ipcChannel.openFileChannel),
  removeToggleView: () =>
    ipcRenderer.removeAllListeners(ipcChannel.toggleViewChannel),
  getConfigPath: () => ipcRenderer.invoke(ipcChannel.configPathChannel),
  openRecentFile: filepath =>
    ipcRenderer.send(ipcChannel.openRecentFile, filepath),
  sendSavedInfo: callback => ipcRenderer.on(ipcChannel.sendSavedInfo, callback),
  removeSendSavedInfo: () =>
    ipcRenderer.removeAllListeners(ipcChannel.sendSavedInfo),
  vimOption: option => ipcRenderer.invoke(ipcChannel.vimOptionChannel, option),
  updateCache: cache =>
    ipcRenderer.invoke(ipcChannel.updateCacheFromReact, cache),
  initialedRender: () => ipcRenderer.invoke(ipcChannel.initialedRender),
  updateHeadInfo: headInfo =>
    ipcRenderer.invoke(ipcChannel.updateHeadInfoFromReact, headInfo)
})
