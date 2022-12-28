const { app, BrowserWindow, dialog, Menu, protocol } = require('electron');
const path = require('path');

require('@electron/remote/main').initialize()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// for menu
const isMac = process.platform === 'darwin'
let openFilePath = ''

async function handleOpen() {
  console.log('into Open file')
  const { canceled, filePaths } = await dialog.showOpenDialog()

  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
}


const createWindow = () => {
  // Create the browser window.
  openFilePath = ""
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,  // makd sure to use `path` and `fs` in react module
      enableRemoteModule: true,
      contextIsolation: true
    },
  });

  // show close dialog
  mainWindow.on('close', function(e) {
    let response = dialog.showMessageBoxSync(this, {
      type: 'info',
      buttons: ['Ok', 'Exit'],
      title: 'Warning',
      cancelId: 1,
      defaultId: 0,
      detail: 'The app is under development, make sure everything is saved before exiting.'
    });

    if (response == 1) e.preventDefault();
  })

  // menu template ----------------------------------------
  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
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
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
          label: "open file",
          click: async () => {
            const filePath = await handleOpen()
            if (filePath) {
              mainWindow.webContents.send('open-file', filePath)
              openFilePath = filePath
            }
          },
          accelerator: process.platform === 'darwin' ? 'Cmd+o' : 'Ctrl+o',
        },
        {
          label: "save file",
          click: () => {
            if (openFilePath !== '') {
              let response = dialog.showMessageBoxSync(null, {
                message: 'Since the application is under developed, so, do you want to save file to',
                type: 'info',
                buttons: ['Yes', 'No'],
                defaultId: 0,
                cancelId: 1,
                detail: `${openFilePath}`
              })
              if (response == 1) {
                console.log("cancel save")
              } else {
                console.log('using save file piple')
                mainWindow.webContents.send('save-file', openFilePath)
              }
            }
          },
          accelerator: process.platform === 'darwin' ? 'Cmd+s' : 'Ctrl+s',
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
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
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
          accelerator: process.platform === 'darwin' ? 'Cmd+Shift+p' : 'Ctrl+Shift+p',
        },
        {
          label: "Just Editor",
          click: async () => {
            mainWindow.webContents.send('toggle-view', 2)
          },
          accelerator: process.platform === 'darwin' ? 'Cmd+Shift+e' : 'Ctrl+Shift+e',
        },
        {
          label: "Normal View",
          click: async () => {
            mainWindow.webContents.send('toggle-view', 0)
          },
          accelerator: process.platform === 'darwin' ? 'Cmd+Shift+n' : 'Ctrl+Shift+n'
        }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    }
  ]
  // END ---------------------------------------------

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
app.whenReady().then(() => {
  protocol.registerFileProtocol("atom", (request, callback) => {
    const url = request.url.substr(7)
    callback(decodeURI(path.normalize(url)))
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {

  console.log('into close window')
  openFilePath = ""

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    openFilePath = ""
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
