import { app, BrowserWindow, dialog, Menu, protocol, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'

// custom import
import { HeadInfo } from './types/main'
import ipcConfig from './config/ipc.config'
import createMenus from './window/menu/menu'
import {
  defaultAppDirectory,
  closeMessage,
  formatWin32Title
} from './window/tools'
import {
  dirOpenCallback,
  fileOpenCallback,
  saveFileCallback,
  createFileCallback,
  OpenFileType,
  FileCache,
  UpdateFileData
} from './window/menu/menu-callbakc'
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

// custom code
const LOG_NAME = 'imarkdown.log'
const CONFIG_NAME = 'imarkdown.json'

let fileCache: FileCache = {}
let currentFilePath: string = ''
let win: BrowserWindow | null = null

// generate default app directory
const { configDir, logDir } = defaultAppDirectory()

const createWindow = (): void => {
  // Create the browser window.
  fileCache = {}
  currentFilePath = ''

  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, './icons/markdown.ico'),
    width: 1280,
    height: 700,
    minWidth: 800,
    minHeight: 400,
    frame: false,
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  win = mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
app.whenReady().then(() => {
  protocol.registerFileProtocol('atom', (request, callback) => {
    let url = request.url.substring(7)
    if (url.startsWith('.') && currentFilePath) {
      url = path.join(path.dirname(currentFilePath), url)
    }
    callback(decodeURI(path.normalize(url)))
  })

  // some ipc event
  ipcMain.handle(ipcConfig.GET_CONFIG, async () => {
    try {
      return fs.readFileSync(path.join(configDir, CONFIG_NAME), 'utf8')
    } catch (err) {
      throw err
    }
  })

  // listen to file content save event
  ipcMain.on(
    ipcConfig.SAVE_CONTENT,
    async (_, totalContent: string, docContent: string, filepath: string) => {
      fs.writeFile(filepath, totalContent, err => {
        if (err) {
          throw err
        }
      })
      fs.appendFile(
        path.join(logDir, LOG_NAME),
        `[LOG] ${new Date().toLocaleString()} - ${filepath} - save content\n`,
        'utf8',
        err => {
          if (err) {
            throw err
          }
        }
      )

      // update file cache
      fileCache[filepath].fileData.content = docContent
      fileCache[filepath].fileData.isChange = false

      // sent message to renderer process
      // win?.webContents.send(ipcConfig.SEND_SAVE_INFO, `${filepath} written\n`)
    }
  )

  // listen to dir module file click
  ipcMain.on(ipcConfig.DIR_ITEM_CLICK, async (_, filepath: string) => {
    if (filepath && filepath !== '') {
      fileOpenCallback(fileCache, filepath).then((res: OpenFileType) => {
        if (res && res.fileData && res.fileInfo) {
          fileCache[res.fileInfo.id] = {
            fileInfo: res.fileInfo,
            fileData: res.fileData
          }
        }
      })
      currentFilePath = filepath
      win?.setTitle(formatWin32Title(currentFilePath))
    }
  })

  // listen to open recent file event
  ipcMain.on(ipcConfig.OPEN_RECENT_FILE, async (_, filepath: string) => {
    if (fileCache.hasOwnProperty(filepath)) {
      win?.webContents.send(ipcConfig.OPEN_FILE, {
        fileInfo: fileCache[filepath].fileInfo,
        fileData: fileCache[filepath].fileData
      })
      currentFilePath = filepath
      win?.setTitle(formatWin32Title(currentFilePath))
    }
  })

  // listen to doc content change event
  ipcMain.on(ipcConfig.UPDATE_DOC_CACHE, async (_, update: UpdateFileData) => {
    const { filepath, fileData } = update
    if (filepath && fileData.content && fileCache.hasOwnProperty(filepath)) {
      fileCache[filepath].fileData.content = fileData.content
      fileCache[filepath].fileData.isChange = true
    }
  })
  // listen to header info change event
  ipcMain.on(ipcConfig.UPDATE_HEADER, async (_, update: UpdateFileData) => {
    const { filepath, fileData } = update
    if (filepath && fileData.headInfo && fileCache.hasOwnProperty(filepath)) {
      let key: keyof HeadInfo
      const { headInfo } = fileData
      for (key in headInfo) {
        if (headInfo[key]) {
          fileCache[filepath].fileData.headInfo[key] = headInfo[key]
        }
      }
      fileCache[filepath].fileData.isChange = true
    }
  })
  // listen to update file scroll position
  ipcMain.on(ipcConfig.UPDATE_SCROLL_POS, async (_, update: UpdateFileData) => {
    const { filepath, fileData } = update
    if (filepath && fileData.scrollPos && fileCache.hasOwnProperty(filepath)) {
      fileCache[filepath].fileData.scrollPos = fileData.scrollPos
    }
  })

  // listen to open app by file
  ipcMain.handle(ipcConfig.INIT_RENDERER, async () => {
    if (process.argv.length > 1 && process.argv[1] !== '.') {
      // currentFilePath = convertWindowsPathToUnixPath(process.argv[1])
      // win?.setTitle(formatWin32Title(currentFilePath))
      // try {
      //   const fileContent = fs.readFileSync(currentFilePath, 'utf8')
      //   const parseContent = matter(fileContent)
      //   fileCache[currentFilePath] = {
      //     fileContent: parseContent.content,
      //     headInfo: parseContent.data,
      //     isChange: false
      //   }
      //   return JSON.stringify({
      //     fullpath: currentFilePath,
      //     fileContent: parseContent.content,
      //     headInfo: parseContent.data,
      //     isChange: false
      //   })
      // } catch (err) {
      //   throw err
      // }
    }
  })

  // close, min, max window
  ipcMain.on(ipcConfig.CLOSE_WINDOW, async () => {
    win?.close()
  })
  ipcMain.on(ipcConfig.MINIMIZE_WINDOW, async () => {
    win?.minimize()
  })
  ipcMain.on(ipcConfig.MAXIMIZE_WINDOW, async () => {
    if (win?.isMaximized()) {
      win?.unmaximize()
    } else {
      win?.maximize()
    }
  })

  // listen close app event
  win?.on('close', function (e) {
    let showCloseDialog = false
    for (const key in fileCache) {
      if (fileCache[key].fileData.isChange === true) {
        showCloseDialog = true
        break
      }
    }

    if (showCloseDialog) {
      const res = dialog.showMessageBoxSync(this, closeMessage)
      if (res === 1) {
        e.preventDefault()
      }
    }
  })

  // create a menu
  const openDirWrapper = () => {
    dirOpenCallback()
  }
  const openFileWrapper = () => {
    fileOpenCallback(fileCache).then(res => {
      if (res) {
        if (!fileCache.hasOwnProperty(res.fileInfo.id)) {
          fileCache[res.fileInfo.id] = {
            fileInfo: res.fileInfo,
            fileData: res.fileData
          }
        }
        currentFilePath = res.fileInfo.id
        win?.setTitle(formatWin32Title(currentFilePath))
      }
    })
  }
  const saveFileWrapper = () => {
    saveFileCallback(currentFilePath)
  }
  const createFileWrapper = () => {
    createFileCallback().then(res => {
      if (res) {
        fileCache[res.fileInfo.id] = {
          fileInfo: res.fileInfo,
          fileData: res.fileData
        }
        currentFilePath = res.fileInfo.id
        win?.setTitle(formatWin32Title(currentFilePath))
      }
    })
  }
  const justPreviewWrapper = () => {
    win?.webContents.send(ipcConfig.TOGGLE_VIEW, 1)
  }
  const justEditWrapper = () => {
    win?.webContents.send(ipcConfig.TOGGLE_VIEW, 2)
  }
  const livePreviewWrapper = () => {
    win?.webContents.send(ipcConfig.TOGGLE_VIEW, 3)
  }
  const toggleSidebarWrapper = () => {
    win?.webContents.send(ipcConfig.TOGGLE_VIEW, 4)
  }
  const headNavWrapper = () => {
    win?.webContents.send(ipcConfig.TOGGLE_VIEW, 5)
  }
  const toggleMidbarWrapper = () => {
    win?.webContents.send(ipcConfig.TOGGLE_VIEW, 6)
  }
  const formatWrapper = () => {
    win?.webContents.send(ipcConfig.FORMAT_FILE)
  }
  const menuTemplate = createMenus(
    openDirWrapper,
    openFileWrapper,
    saveFileWrapper,
    createFileWrapper,
    justPreviewWrapper,
    justEditWrapper,
    livePreviewWrapper,
    toggleSidebarWrapper,
    toggleMidbarWrapper,
    headNavWrapper,
    formatWrapper
  )
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  // show menu when click menu icon in title bar
  ipcMain.on(ipcConfig.SHOW_MENU, function (_, args) {
    if (win) {
      menu.popup({
        window: win,
        x: args.x,
        y: args.y
      })
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
