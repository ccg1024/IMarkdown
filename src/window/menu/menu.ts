import { app } from 'electron'
import type { MenuItemConstructorOptions } from 'electron'

import {
  openFileWrapper,
  saveFileWrapper,
  createFileWrapper,
  openDirWrapper,
  viewController,
  formatContentWrapper
} from './menu-callback'

export default function createMenus(): MenuItemConstructorOptions[] {
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
          click: openFileWrapper,
          accelerator: isMac ? 'Cmd+o' : 'Ctrl+o'
        },
        {
          label: 'save file',
          click: saveFileWrapper,
          accelerator: isMac ? 'Cmd+s' : 'Ctrl+s'
        },
        {
          label: 'create file',
          click: createFileWrapper,
          accelerator: isMac ? 'Cmd+n' : 'Ctrl+n'
        },
        {
          label: 'open dir',
          click: openDirWrapper,
          accelerator: isMac ? 'Cmd+w' : 'Ctrl+w'
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
          click: (menuItem, win, event) =>
            viewController(menuItem, win, event, 1),
          accelerator: isMac ? 'Cmd+Shift+p' : 'Ctrl+Shift+p'
        },
        {
          label: 'Just Editor',
          click: (menuItem, win, event) =>
            viewController(menuItem, win, event, 2),
          accelerator: isMac ? 'Cmd+Shift+e' : 'Ctrl+Shift+e'
        },
        {
          label: 'Live Preview',
          click: (menuItem, win, event) =>
            viewController(menuItem, win, event, 3),
          accelerator: isMac ? 'Cmd+Shift+l' : 'Ctrl+Shift+l'
        },
        {
          label: 'Toggle Sidebar',
          click: (menuItem, win, event) =>
            viewController(menuItem, win, event, 4),
          accelerator: isMac ? 'Cmd+Shift+s' : 'Ctrl+Shift+s'
        },
        {
          label: 'Toggle Midbar',
          click: (menuItem, win, event) =>
            viewController(menuItem, win, event, 6),
          accelerator: isMac ? 'Cmd+Shift+t' : 'Ctrl+Shift+t'
        },
        {
          label: 'Toggle Headnav',
          click: (menuItem, win, event) =>
            viewController(menuItem, win, event, 5),
          accelerator: isMac ? 'Cmd+Shift+h' : 'Ctrl+Shift+h'
        },
        { type: 'separator' },
        {
          label: 'Format File',
          click: formatContentWrapper,
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
