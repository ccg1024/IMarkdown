function generateMenus(
  isMac,
  appname,
  openFileCallback,
  saveFileCallback,
  createFileCallback,
  togglePreviewCallback,
  toggleEditorCallback,
  livePreviewCallback,
  toggleSideCallback
) {
  const template = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: appname,
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
          click: openFileCallback,
          accelerator: process.platform === 'darwin' ? 'Cmd+o' : 'Ctrl+o'
        },
        {
          label: 'save file',
          click: saveFileCallback,
          accelerator: process.platform === 'darwin' ? 'Cmd+s' : 'Ctrl+s'
        },
        {
          label: 'create file',
          click: createFileCallback,
          accelerator: process.platform === 'darwin' ? 'Cmd+n' : 'Ctrl+n'
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
          click: togglePreviewCallback,
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+p' : 'Ctrl+Shift+p'
        },
        {
          label: 'Just Editor',
          click: toggleEditorCallback,
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+e' : 'Ctrl+Shift+e'
        },
        {
          label: 'Live Preview',
          click: livePreviewCallback,
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+l' : 'Ctrl+Shift+l'
        },
        {
          label: 'Toggle Sidebar',
          click: toggleSideCallback,
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+s' : 'Ctrl+Shift+s'
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

  return template
}

module.exports = {
  generateMenus: generateMenus
}
