/**
 * menu item callback and some internal function
 * @author crazycodegame
 */
import fs from 'fs'
import matter from 'gray-matter'
import { BrowserWindow, MenuItem, KeyboardEvent } from 'electron'

import { HeadInfo, MarkFile, FileData, OpenFileType } from 'src/types'
import ipcConfig from 'src/config/ipc.config'
import { fileOpenDialog, createFileDialog, dirOpenDialog } from '../dialog'
import { getMarkFiles, getMarkFile, getTempMarkFile } from '../tools'
import {
  touchFileCache,
  touchCurrentFile,
  setCurrentFile,
  addFileCache,
  hasCache
} from 'src/index'

export async function dirOpenCallback() {
  const dirPath = await dirOpenDialog()

  if (dirPath) {
    const markFile = await getMarkFiles(dirPath)
    return markFile
  }
}

export async function fileOpenCallback(path?: string): Promise<OpenFileType> {
  let filepath, fileInfo: MarkFile, fileData: FileData
  if (path === undefined || path === null || path === '') {
    filepath = await fileOpenDialog()
  } else {
    filepath = path
  }

  if (filepath) {
    const cached = hasCache(filepath)
    if (cached) {
      const fileCache = touchFileCache()
      fileInfo = fileCache[filepath].fileInfo
      fileData = fileCache[filepath].fileData
    } else {
      fileInfo = await getMarkFile(filepath)

      const fileContent = fs.readFileSync(filepath, 'utf8')
      const parseContent = matter(fileContent)
      const headInfo = parseContent.data as HeadInfo<string>

      fileData = {
        headInfo,
        content: parseContent.content,
        isChange: false,
        scrollPos: undefined
      }
      addFileCache(filepath, { fileInfo, fileData })
    }

    return {
      fileInfo,
      fileData
    }
  }
}

export async function saveFileCallback(win: BrowserWindow, filepath: string) {
  win?.webContents.send(ipcConfig.SAVE_FILE, filepath)
}

export async function createFileCallback(): Promise<OpenFileType> {
  const filepath = await createFileDialog()
  if (filepath) {
    const headInfo = {
      title: '',
      desc: ''
    }
    const fileInfo: MarkFile = getTempMarkFile(filepath)
    const fileData: FileData = {
      headInfo,
      content: '',
      isChange: false,
      scrollPos: undefined
    }
    addFileCache(filepath, { fileInfo, fileData })
    return {
      fileInfo,
      fileData
    }
  }
}

// wrapper function is using in menu click

export async function openFileWrapper(
  _menuItem: MenuItem,
  win: BrowserWindow,
  _event: KeyboardEvent
) {
  fileOpenCallback()
    .then(file => {
      if (file) {
        win?.webContents.send(ipcConfig.OPEN_FILE, { ...file })
        setCurrentFile(file.fileInfo.id)
      }
    })
    .catch(err => {
      throw err
    })
}
export async function saveFileWrapper(
  _menuItem: MenuItem,
  win: BrowserWindow,
  _event: KeyboardEvent
) {
  const filepath = touchCurrentFile()
  if (filepath !== '') {
    saveFileCallback(win, filepath)
  } else {
    throw new Error(
      `the current filepath on main process is empty: ${filepath}`
    )
  }
}
export async function createFileWrapper(
  _menuItem: MenuItem,
  win: BrowserWindow,
  _event: KeyboardEvent
) {
  createFileCallback()
    .then(file => {
      if (file) {
        win?.webContents.send(ipcConfig.OPEN_FILE, { ...file })
        setCurrentFile(file.fileInfo.id)
      }
    })
    .catch(err => {
      throw err
    })
}
export async function openDirWrapper(
  _menuItem: MenuItem,
  win: BrowserWindow,
  _event: KeyboardEvent
) {
  dirOpenCallback()
    .then(fileInfos => {
      if (fileInfos) {
        win?.webContents.send(ipcConfig.OPEN_DIR, fileInfos)
      }
    })
    .catch(err => {
      throw err
    })
}
export async function viewController(
  _menuItem: MenuItem,
  win: BrowserWindow,
  _event: KeyboardEvent,
  viewOption: number
) {
  win?.webContents.send(ipcConfig.TOGGLE_VIEW, viewOption)
}
export async function formatContentWrapper(
  _menuItem: MenuItem,
  win: BrowserWindow,
  _event: KeyboardEvent
) {
  win?.webContents.send(ipcConfig.FORMAT_FILE)
}
