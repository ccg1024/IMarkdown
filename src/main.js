const {
  app,
  BrowserWindow,
  dialog,
  Menu,
  protocol,
  ipcMain
} = require('electron')
const path = require('path')

require('@electron/remote/main').initialize()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

// for menu
const isMac = process.platform === 'darwin'
let openFilePath = ''
let isContentChange = false
const fs = require('fs')
const { mkdir } = require('fs/promises')

const HOME_PTATH = process.env.HOME

const configPath =
  process.platform === 'win32'
    ? HOME_PTATH + '\\Imarkdown'
    : HOME_PTATH + '/.local/state/Imarkdown'

const logPath =
  process.platform === 'win32'
    ? HOME_PTATH + '\\Imarkdown\\log\\'
    : HOME_PTATH + '/.local/state/Imarkdown/log/'

// create cache dir
const createFolder = async path => {
  try {
    if (!fs.existsSync(path)) {
      await mkdir(path, { recursive: true })
    }
  } catch (error) {
    console.log(error.message)
  }
}

createFolder(logPath)

console.log('[LOG]' + logPath)

async function handleOpen() {
  console.log('into Open file')
  const { canceled, filePaths } = await dialog.showOpenDialog()

  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
}

async function handleEmptyFileSave() {
  console.log('into handle empty file save')
  const { canceled, filePath } = await dialog.showSaveDialog()

  if (canceled) {
    return
  } else {
    return filePath
  }
}

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
  ipcMain.on('set-filePath', (_event, filePath) => {
    openFilePath = filePath
    mainWindow.setTitle(openFilePath)
  })

  // recive content change flag
  ipcMain.on('set-contentChange', (_event, isChange) => {
    isContentChange = isChange
  })

  // show unsaved info, when using recient file
  ipcMain.on('show-unsavedInfo', _event => {
    dialog.showMessageBoxSync(null, {
      type: 'info',
      title: 'Warning',
      message: 'The file is unsaved'
    })
  })

  // show close dialog
  mainWindow.on('close', function (e) {
    if (isContentChange) {
      let response = dialog.showMessageBoxSync(this, {
        type: 'info',
        buttons: ['Yes', 'No'],
        title: 'Warning',
        cancelId: 1,
        defaultId: 0,
        detail:
          'The app is under development, make sure everything is saved before exiting. Exit now?'
      })

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
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
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
          click: async () => {
            let skipOpenFile = false
            if (isContentChange) {
              let response = dialog.showMessageBoxSync(null, {
                type: 'info',
                buttons: ['Yes', 'No'],
                title: 'Warning',
                cancelId: 1,
                defaultId: 0,
                detail:
                  'current file is changed, and not save yet. Return to save File?'
              })

              if (response === 0) {
                skipOpenFile = true
              }
            }
            if (!skipOpenFile) {
              const filePath = await handleOpen()
              if (filePath) {
                mainWindow.webContents.send('open-file', filePath)
                openFilePath = filePath
                mainWindow.setTitle(openFilePath)
              }
            }
          },
          accelerator: process.platform === 'darwin' ? 'Cmd+o' : 'Ctrl+o'
        },
        {
          label: 'save file',
          click: async () => {
            // console.log('using save file piple')
            try {
              if (openFilePath === '') {
                openFilePath = await handleEmptyFileSave()
                if (typeof openFilePath !== 'undefined') {
                  // console.log('the new file path is: ' + openFilePath)
                  mainWindow.setTitle(openFilePath)
                  mainWindow.webContents.send('save-file', openFilePath, 1)
                  // for empty file
                  const current = new Date()
                  const timeInfoPre = [
                    current.getFullYear(),
                    current.getMonth() + 1,
                    current.getDate()
                  ]
                  const timeInfoAft = [
                    current.getHours(),
                    current.getMinutes(),
                    current.getSeconds()
                  ]
                  fs.appendFile(
                    logPath + 'imarkdown.log',
                    '[saveEmptyFile] ' +
                      openFilePath +
                      ' ' +
                      timeInfoPre.join('-') +
                      ' ' +
                      timeInfoAft.join(':') +
                      '\n',
                    'utf8',
                    err => {
                      if (err) throw err
                    }
                  )
                } else {
                  openFilePath = ''
                }
              } else {
                if (typeof openFilePath == 'undefined') {
                  openFilePath = ''
                } else {
                  // for opened file
                  const current = new Date()
                  const timeInfoPre = [
                    current.getFullYear(),
                    current.getMonth() + 1,
                    current.getDate()
                  ]
                  const timeInfoAft = [
                    current.getHours(),
                    current.getMinutes(),
                    current.getSeconds()
                  ]
                  fs.appendFile(
                    logPath + 'imarkdown.log',
                    '[saveFile] ' +
                      openFilePath +
                      ' ' +
                      timeInfoPre.join('-') +
                      ' ' +
                      timeInfoAft.join(':') +
                      '\n',
                    'utf8',
                    err => {
                      if (err) throw err
                    }
                  )
                  mainWindow.webContents.send('save-file', openFilePath)
                }
              }
            } catch (err) {
              // fs.writeFile(logPath + 'imarkdown.log', '[ERROR] ' + err.message)
              console.log(err)
              const current = new Date()
              const timeInfoPre = [
                current.getFullYear(),
                current.getMonth() + 1,
                current.getDate()
              ]
              const timeInfoAft = [
                current.getHours(),
                current.getMinutes(),
                current.getSeconds()
              ]
              fs.appendFile(
                logPath + 'imarkdown.log',
                '[Error] ' +
                  err +
                  ' ' +
                  timeInfoPre.join('-') +
                  ' ' +
                  timeInfoAft.join(':') +
                  '\n',
                'utf8',
                err => {
                  if (err) throw err
                }
              )
            }
          },
          accelerator: process.platform === 'darwin' ? 'Cmd+s' : 'Ctrl+s'
        },
        {
          label: 'create file',
          click: async () => {
            let tempFilePath = await handleEmptyFileSave()
            if (tempFilePath !== undefined) {
              console.log('create new empty file')
              // write empty to create file
              fs.writeFileSync(tempFilePath, '')
              mainWindow.setTitle(tempFilePath)
              mainWindow.webContents.send('open-file', tempFilePath)
              openFilePath = tempFilePath
            } else {
              console.log('cancel create file')
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Speech',
                submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
              }
            ]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Just Preview',
          click: async () => {
            mainWindow.webContents.send('toggle-view', 1)
          },
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+p' : 'Ctrl+Shift+p'
        },
        {
          label: 'Just Editor',
          click: async () => {
            mainWindow.webContents.send('toggle-view', 2)
          },
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+e' : 'Ctrl+Shift+e'
        }
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
  ipcMain.handle('get-config-path', () => configPath)
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
