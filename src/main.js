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

const { openFileDialog, handleEmptyFileSave } = require('./window/dialog')
const {
  generatorPath,
  closeMessageConfig,
  fileUnsaveMessageConfig
} = require('./window/config')
const { logTime, converWin32Path } = require('./utils/backend')
const ipcChannel = require('./config/backend')

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

// ---------------------------------------------------
const ifSkipOpenFile = isChange => {
  let skip = false
  if (isChange) {
    let response = dialog.showMessageBoxSync(null, fileUnsaveMessageConfig)
    if (response === 0) {
      skip = true
    }
  }
  return skip
}

async function openFileCallback(win) {
  let skipOpenFile = ifSkipOpenFile(isContentChange)
  if (!skipOpenFile) {
    const filePath = await openFileDialog()
    if (filePath) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8')
        win.webContents.send(
          ipcChannel.openFileChannel,
          converWin32Path(filePath),
          fileContent,
          path.basename(filePath)
        )
      } catch (e) {
        console.log(e)
      }
    }
  }
}

async function saveFileCallback(win, openedFile) {
  try {
    if (openedFile === '') {
      let tempFilePath = await handleEmptyFileSave()

      if (tempFilePath) {
        win.webContents.send(ipcChannel.saveFileChannel, tempFilePath)

        const saveLogTime = logTime()
        fs.appendFile(
          logPath + 'imarkdown.log',
          '[saveEmptyFile] ' + tempFilePath + ' ' + saveLogTime + '\n',
          'utf8',
          err => {
            if (err) throw err
          }
        )
      }
    } else {
      const saveLogTime = logTime()
      fs.appendFile(
        logPath + 'imarkdown.log',
        '[saveFile] ' + openedFile + ' ' + saveLogTime + '\n',
        'utf8',
        err => {
          if (err) throw err
        }
      )
      win.webContents.send(ipcChannel.saveFileChannel, openedFile)
    }
  } catch (err) {
    const saveLogTime = logTime()
    fs.appendFile(
      logPath + 'imarkdown.log',
      '[Error] ' + err + ' ' + saveLogTime + '\n',
      'utf8',
      err => {
        if (err) throw err
      }
    )
  }
}

async function createFileCallback(win) {
  let tempFilePath = await handleEmptyFileSave()
  if (tempFilePath) {
    fs.writeFileSync(tempFilePath, '')
    win.setTitle(tempFilePath)
    win.webContents.send(ipcChannel.openFileChannel, tempFilePath)
    openFilePath = tempFilePath
  }
}

// --------------------------------------------------

const createWindow = () => {
  // Create the browser window.
  openFilePath = ''
  const mainWindow = new BrowserWindow({
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

  ipcMain.on(ipcChannel.reciveContentChannel, (_event, content, path) => {
    fs.writeFile(path, content, err => {
      if (err) throw err
    })
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

  // show close dialog
  mainWindow.on('close', function (e) {
    if (isContentChange) {
      let response = dialog.showMessageBoxSync(this, closeMessageConfig)
      if (response == 1) e.preventDefault()
    }
  })

  // menu template ----------------------------------------
  const template = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ]
      : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
          label: 'open file',
          click: () => openFileCallback(mainWindow),
          accelerator: process.platform === 'darwin' ? 'Cmd+o' : 'Ctrl+o'
        },
        {
          label: 'save file',
          click: () => saveFileCallback(mainWindow, openFilePath),
          accelerator: process.platform === 'darwin' ? 'Cmd+s' : 'Ctrl+s'
        },
        {
          label: 'create file',
          click: () => createFileCallback(mainWindow)
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: 'Just Preview',
          click: async () => {
            mainWindow.webContents.send(ipcChannel.toggleViewChannel, 1)
          },
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+p' : 'Ctrl+Shift+p'
        },
        {
          label: 'Just Editor',
          click: async () => {
            mainWindow.webContents.send(ipcChannel.toggleViewChannel, 2)
          },
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+e' : 'Ctrl+Shift+e'
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' }
            ]
          : [{ role: 'close' }])
      ]
    }
  ]
  // END ---------------------------------------------

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
