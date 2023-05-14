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
const matter = require('gray-matter')

const ipcChannel = require('./config/backend')
const { generateMenus } = require('./window/menus')
const { generatorPath, closeMessageConfig } = require('./window/config')
const {
  openFileCallback,
  saveFileCallback,
  createFileCallback
} = require('./window/menus-callback')

const { vimOption } = require('./config/vim-option')
const { formatWinTitle, converWin32Path } = require('./utils/backend')

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
          headInfo: fileObj.headInfo,
          isChange: fileObj.isChange
        }
      }
      if (fileObj) {
        openFilePath = fileObj.filePath
        mainWindow.setTitle(formatWinTitle(openFilePath))
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
          headInfo: fileObj.headInfo,
          isChange: fileObj.isChange
        }
        openFilePath = fileObj.filePath
        mainWindow.setTitle(formatWinTitle(openFilePath))
      }
    })
  }
  const togglePreviewWrapper = () => {
    mainWindow.webContents.send(ipcChannel.toggleViewChannel, 1)
  }
  const toggleEditorWrapper = () => {
    mainWindow.webContents.send(ipcChannel.toggleViewChannel, 2)
  }
  const livePreviewWrapper = () => {
    mainWindow.webContents.send(ipcChannel.toggleViewChannel, 3)
  }
  const toggleSideWrapper = () => {
    mainWindow.webContents.send(ipcChannel.toggleViewChannel, 4)
  }

  // recive file content from renderer then save file content to local
  ipcMain.on(
    ipcChannel.reciveContentChannel,
    (_event, totalContent, markContent, path) => {
      let saveErr
      fs.writeFile(path, totalContent, err => {
        if (err) {
          saveErr = err.message
        }
      })

      if (!Object.hasOwn(fileCache, path)) {
        fileCache[path] = {}
        fileCache[path].headInfo = {}
      }
      fileCache[path].fileContent = markContent
      fileCache[path].isChange = false

      if (!openFilePath) {
        openFilePath = path
        mainWindow.setTitle(formatWinTitle(openFilePath))
      }

      mainWindow.webContents.send(
        ipcChannel.sendSavedInfo,
        path + ' written',
        saveErr
      )
    }
  )

  // open recent file when click side file dir component
  ipcMain.on(ipcChannel.openRecentFile, (_event, filepath) => {
    if (Object.hasOwn(fileCache, filepath)) {
      mainWindow.webContents.send(
        ipcChannel.openFileChannel,
        filepath,
        fileCache[filepath].fileContent,
        fileCache[filepath].headInfo,
        fileCache[filepath].isChange
      )
      openFilePath = filepath
      mainWindow.setTitle(formatWinTitle(openFilePath))
    }
  })

  // handle vim option
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
          fileCache[jsonData.filepath].headInfo,
          fileCache[jsonData.filepath].isChange
        )
        openFilePath = jsonData.filepath
        mainWindow.setTitle(formatWinTitle(openFilePath))
      }
    }
  })

  // update file cache from renderer
  ipcMain.handle(ipcChannel.updateCacheFromReact, async (_event, cache) => {
    if (cache && openFilePath) {
      const jsonData = JSON.parse(cache)
      if (!Object.hasOwn(fileCache, openFilePath)) {
        fileCache[openFilePath] = {}
        fileCache[openFilePath].headInfo = {}
      }
      fileCache[openFilePath].fileContent = jsonData.fileContent
      fileCache[openFilePath].isChange = true
    }
  })
  // update head info from renderer
  ipcMain.handle(
    ipcChannel.updateHeadInfoFromReact,
    async (_event, headInfo) => {
      if (headInfo && openFilePath) {
        if (!Object.hasOwn(fileCache, openFilePath)) {
          fileCache[openFilePath] = {}
          fileCache[openFilePath].headInfo = {}
        }
        if (headInfo.title) {
          fileCache[openFilePath].headInfo.title = headInfo.title
          fileCache[openFilePath].isChange = true
        }
        if (headInfo.desc) {
          fileCache[openFilePath].headInfo.desc = headInfo.desc
          fileCache[openFilePath].isChange = true
        }
      }
    }
  )

  ipcMain.handle(ipcChannel.initialedRender, async () => {
    if (process.argv.length >= 2 && process.argv[1] !== '.') {
      openFilePath = converWin32Path(process.argv[1])
      mainWindow.setTitle(formatWinTitle(openFilePath))
      try {
        const fileContent = fs.readFileSync(openFilePath, 'utf8')
        const parsContent = matter(fileContent)
        fileCache[openFilePath] = {
          fileContent: parsContent.content,
          headInfo: parsContent.data,
          isChange: false
        }
        return JSON.stringify({
          fullpath: openFilePath,
          fileContent: parsContent.content,
          headInfo: parsContent.data,
          isChange: false
        })
      } catch (err) {
        throw err
      }
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
    toggleEditorWrapper,
    livePreviewWrapper,
    toggleSideWrapper
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
    let url = request.url.substring(7)
    if (url.startsWith('.') && openFilePath) {
      url = path.join(path.dirname(openFilePath), url)
    }
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
