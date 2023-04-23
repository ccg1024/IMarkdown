const {
  app,
  BrowserWindow,
  dialog,
  Menu,
  protocol,
  ipcMain
} = require('electron')
const path = require('path')
const fs = require('fs')

const ipcChannel = require('./config/backend')
const { generateMenus } = require('./window/menus')
const { generatorPath, closeMessageConfig } = require('./window/config')
const {
  openFileCallback,
  saveFileCallback,
  createFileCallback
} = require('./window/menus-callback')

const { vimOption } = require('./config/vim-option')

// ---------------------------------------------
require('@electron/remote/main').initialize()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const isMac = process.platform === 'darwin'
let openFilePath = ''
let fileCache = {}

const { configPath, logPath } = generatorPath()

console.log('[LOG]' + logPath)

const createWindow = () => {
  // Create the browser window.
  openFilePath = ''
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, './static/img/markdown.ico'),
    width: 1100,
    height: 700,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true, // makd sure to use `path` and `fs` in react module
      enableRemoteModule: true,
      contextIsolation: true
    }
  })

  // wrap menu callback
  const openFileWrapper = () => {
    openFileCallback(mainWindow, fileCache).then(fileObj => {
      if (fileObj && !Object.hasOwn(fileCache, fileObj.filePath)) {
        fileCache[fileObj.filePath] = {
          fileContent: fileObj.fileContent,
          isChange: fileObj.isChange
        }
      }
    })
  }
  const saveFileWrapper = () => {
    saveFileCallback(mainWindow, openFilePath, logPath)
  }
  const createFileWrapper = () => {
    createFileCallback(mainWindow).then(fileObj => {
      if (fileObj) {
        fileCache[fileObj.filePath] = {
          fileContent: fileObj.fileContent,
          isChange: fileObj.isChange
        }
      }
    })
  }
  const togglePreviewWrapper = () => {
    mainWindow.webContents.send(ipcChannel.toggleViewChannel, 1)
  }
  const toggleEditorWrapper = () => {
    mainWindow.webContents.send(ipcChannel.toggleViewChannel, 2)
  }

  // recive file path from renderer
  ipcMain.on(ipcChannel.updateFilePathChannel, (_event, filePath) => {
    if (filePath) {
      openFilePath = filePath
      mainWindow.setTitle(openFilePath.replace(/^.*?\//, ''))
    }
  })

  // recive content change flag
  ipcMain.on(ipcChannel.setIsChangeChannel, (_event, isChange, filepath) => {
    if (filepath) {
      if (!Object.hasOwn(fileCache, filepath)) {
        fileCache[filepath] = {}
      }
      fileCache[filepath].isChange = isChange
    }
  })

  // show unsaved info, when using recient file
  // ipcMain.on(ipcChannel.showUnsaveChannel, _event => {
  //   dialog.showMessageBoxSync(null, {
  //     type: 'info',
  //     title: 'Warning',
  //     message: 'The file is unsaved'
  //   })
  // })

  // recive file content from renderer then save file content to local
  ipcMain.on(ipcChannel.reciveContentChannel, (_event, content, path) => {
    let saveErr
    fs.writeFile(path, content, err => {
      if (err) {
        saveErr = err.message
      }
    })

    if (!Object.hasOwn(fileCache, path)) {
      fileCache[path] = {}
    }
    fileCache[path].fileContent = content
    fileCache[path].isChange = false

    mainWindow.webContents.send(
      ipcChannel.sendSavedInfo,
      path + ' written',
      saveErr
    )
  })

  ipcMain.on(ipcChannel.openRecentFile, (_event, filepath) => {
    if (Object.hasOwn(fileCache, filepath)) {
      mainWindow.webContents.send(
        ipcChannel.openFileChannel,
        filepath,
        fileCache[filepath].fileContent,
        path.basename(filepath),
        fileCache[filepath].isChange
      )
    }
  })

  ipcMain.handle(ipcChannel.vimOptionChannel, async (_event, value) => {
    const jsonData = JSON.parse(value)
    if (vimOption.writeFile === jsonData.option) {
      saveFileWrapper()
    } else if (vimOption.openFile === jsonData.option) {
      openFileWrapper()
    } else if (vimOption.openRecentFile === jsonData.option) {
      if (Object.hasOwn(fileCache, jsonData.filepath)) {
        mainWindow.webContents.send(
          ipcChannel.openFileChannel,
          jsonData.filepath,
          fileCache[jsonData.filepath].fileContent,
          path.basename(jsonData.filepath),
          fileCache[jsonData.filepath].isChange
        )
      }
    }
  })

  ipcMain.handle(ipcChannel.updateCacheFromReact, async (_event, cache) => {
    if (cache) {
      const jsonData = JSON.parse(cache)
      if (!Object.hasOwn(fileCache, jsonData.filePath)) {
        fileCache[jsonData.filePath] = {}
      }
      fileCache[jsonData.filePath].fileContent = jsonData.fileContent
    }
  })

  // show close dialog
  mainWindow.on('close', function (e) {
    let showCloseDialog = false
    for (let key in fileCache) {
      if (fileCache[key].isChange === true) {
        showCloseDialog = true
        break
      }
    }
    if (showCloseDialog) {
      let response = dialog.showMessageBoxSync(this, closeMessageConfig)
      if (response == 1) e.preventDefault()
    }
  })

  const template = generateMenus(
    isMac,
    app.name,
    openFileWrapper,
    saveFileWrapper,
    createFileWrapper,
    togglePreviewWrapper,
    toggleEditorWrapper
  )
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
app.whenReady().then(() => {
  ipcMain.handle(ipcChannel.configPathChannel, () => {
    try {
      return fs.readFileSync(path.join(configPath, 'imarkdown.json'), 'utf8')
    } catch (err) {
      console.log(err)
    }
  })
  protocol.registerFileProtocol('atom', (request, callback) => {
    const url = request.url.substring(7)
    callback(decodeURI(path.normalize(url)))
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  console.log('into close window')
  openFilePath = ''

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    openFilePath = ''
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
