import { app } from 'electron'
import type { MenuItemConstructorOptions } from 'electron'

export default function createMenus(
  openFileCallback: any,
  saveFileCallback: any,
  createFileCallback: any,
  justPreviewCallback: any,
  justEditCallback: any,
  livePreviewCallback: any,
  toggleSideBarCallback: any,
  headNavCallback: any,
  formatFileCallback: any
): MenuItemConstructorOptions[] {
  // const appname = app.name
  const isMac = process.platform === 'darwin'

  return [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'quit' }
            ] as MenuItemConstructorOptions[]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'open file',
          click: openFileCallback,
          accelerator: isMac ? 'Cmd+o' : 'Ctrl+o'
        },
        {
          label: 'save file',
          click: saveFileCallback,
          accelerator: isMac ? 'Cmd+s' : 'Ctrl+s'
        },
        {
          label: 'create file',
          click: createFileCallback,
          accelerator: isMac ? 'Cmd+n' : 'Ctrl+n'
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
          accelerator: isMac ? 'Cmd+Shift+p' : 'Ctrl+Shift+p'
        },
        {
          label: 'Just Editor',
          click: justEditCallback,
          accelerator: isMac ? 'Cmd+Shift+e' : 'Ctrl+Shift+e'
        },
        {
          label: 'Live Preview',
          click: livePreviewCallback,
          accelerator: isMac ? 'Cmd+Shift+l' : 'Ctrl+Shift+l'
        },
        {
          label: 'Toggle Sidebar',
          click: toggleSideBarCallback,
          accelerator: isMac ? 'Cmd+Shift+s' : 'Ctrl+Shift+s'
        },
        {
          label: 'Toggle Headnav',
          click: headNavCallback,
          accelerator: isMac ? 'Cmd+Shift+h' : 'Ctrl+Shift+h'
        },
        { type: 'separator' },
        {
          label: 'Format File',
          click: formatFileCallback,
          accelerator: isMac ? 'Cmd+Shift+f' : 'Ctrl+Shift+f'
        }
      ]
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }]
    }
  ]
}
