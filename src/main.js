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
let isContentChange = false

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
    openFileCallback(mainWindow, isContentChange)
  }
  const saveFileWrapper = () => {
    saveFileCallback(mainWindow, openFilePath, logPath)
  }
  const createFileWrapper = () => {
    createFileCallback(mainWindow)
  }
  const togglePreviewWrapper = () => {
    mainWindow.webContents.send(ipcChannel.toggleViewChannel, 1)
  }
  const toggleEditorWrapper = () => {
    mainWindow.webContents.send(ipcChannel.toggleViewChannel, 2)
  }

  // recive file path from renderer
  ipcMain.on(ipcChannel.updateFilePathChannel, (_event, filePath) => {
    openFilePath = filePath
    mainWindow.setTitle(openFilePath)
  })

  // recive content change flag
  ipcMain.on(ipcChannel.setIsChangeChannel, (_event, isChange) => {
    isContentChange = isChange
  })

  // show unsaved info, when using recient file
  ipcMain.on(ipcChannel.showUnsaveChannel, _event => {
    dialog.showMessageBoxSync(null, {
      type: 'info',
      title: 'Warning',
      message: 'The file is unsaved'
    })
  })

  // recive file content from renderer then save file content to local
  ipcMain.on(ipcChannel.reciveContentChannel, (_event, content, path) => {
    let saveErr
    fs.writeFile(path, content, err => {
      if (err) {
        saveErr = err.message
      }
    })
    mainWindow.webContents.send(
      ipcChannel.sendSavedInfo,
      path + ' written',
      saveErr
    )
  })

  ipcMain.on(ipcChannel.openRecentFile, (_event, filepath) => {
    try {
      const fileContent = fs.readFileSync(filepath, 'utf8')
      mainWindow.webContents.send(
        ipcChannel.openFileChannel,
        filepath,
        fileContent,
        path.basename(filepath)
      )
    } catch (err) {
      console.log(err)
    }
  })

  ipcMain.handle(ipcChannel.vimOptionChannel, async (_event, value) => {
    if (vimOption.writeFile === value) {
      saveFileWrapper()
    } else if (vimOption.openFile === value) {
      openFileWrapper()
    }
  })

  // show close dialog
  mainWindow.on('close', function (e) {
    if (isContentChange) {
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
