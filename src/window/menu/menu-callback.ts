/**
 * menu item callback and some internal function
 * @author crazycodegame
 */
import fs from 'fs'
import matter from 'gray-matter'
import { BrowserWindow, MenuItem, KeyboardEvent } from 'electron'

import { HeadInfo } from 'src/types/main'
import ipcConfig from 'src/config/ipc.config'
import { fileOpenDialog, createFileDialog, dirOpenDialog } from '../dialog'
import { getMarkFiles, getMarkFile, getTempMarkFile, MarkFile } from '../tools'
import {
  touchFileCache,
  touchCurrentFile,
  setCurrentFile,
  addFileCache,
  hasCache
} from 'src/index'

export type FileData = {
  headInfo: HeadInfo
  content: string
  isChange: boolean
  scrollPos?: number
}

export type OpenFileType = {
  fileInfo: MarkFile
  fileData: FileData
}

export type UpdateFileType = {
  fileInfo?: Partial<MarkFile>
  fileData?: Partial<FileData>
}

export type FileCache = {
  [key: string]: OpenFileType
} & Object

export type UpdateFileData = {
  filepath: string
  fileData: Partial<Omit<FileData, 'isChange'>>
}

export async function dirOpenCallback() {
  const dirPath = await dirOpenDialog()

  if (dirPath) {
    try {
      const markFile = await getMarkFiles(dirPath)
      return markFile
    } catch (err) {
      throw err
    }
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
      try {
        fileInfo = await getMarkFile(filepath)

        const fileContent = fs.readFileSync(filepath, 'utf8')
        const parseContent = matter(fileContent)
        const headInfo = parseContent.data as HeadInfo

        fileData = {
          headInfo,
          content: parseContent.content,
          isChange: false,
          scrollPos: undefined
        }
        addFileCache(filepath, { fileInfo, fileData })
      } catch (err) {
        throw err
      }
    }

    return {
      fileInfo,
      fileData
    }
  }
}

export async function saveFileCallback(win: BrowserWindow, filepath: string) {
  try {
    win?.webContents.send(ipcConfig.SAVE_FILE, filepath)
  } catch (err) {
    throw err
  }
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
