// import { app } from 'electron'
import type { MenuItemConstructorOptions } from 'electron'

export default function createMenus(
  openFileCallback: any,
  saveFileCallback: any,
  createFileCallback: any,
  justPreviewCallback: any,
  justEditCallback: any,
  livePreviewCallback: any,
  toggleSideBarCallback: any,
  formatFileCallback: any
): MenuItemConstructorOptions[] {
  // const appname = app.name
  const isMac = process.platform === 'darwin'

  return [
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
    {
      label: 'View',
      submenu: [
        { role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: 'Just Preview',
          click: justPreviewCallback,
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+p' : 'Ctrl+Shift+p'
        },
        {
          label: 'Just Editor',
          click: justEditCallback,
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
          click: toggleSideBarCallback,
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+s' : 'Ctrl+Shift+s'
        },
        { type: 'separator' },
        {
          label: 'Format File',
          click: formatFileCallback,
          accelerator:
            process.platform === 'darwin' ? 'Cmd+Shift+f' : 'Ctrl+Shift+f'
        }
      ]
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }]
    }
  ]
}
