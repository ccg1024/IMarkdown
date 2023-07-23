import fs from 'fs'
import matter from 'gray-matter'
import { BrowserWindow } from 'electron'

import { HeadInfo } from '../../types/main'
import ipcConfig from '../../config/ipc.config'
import { fileOpenDialog, createFileDialog, dirOpenDialog } from '../dialog'
import { getMarkFiles, getMarkFile, getTempMarkFile, MarkFile } from '../tools'

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
      BrowserWindow.getFocusedWindow()?.webContents.send(
        ipcConfig.OPEN_DIR,
        markFile
      )
    } catch (err) {
      throw err
    }
  }
}

export async function fileOpenCallback(
  fileCache: FileCache,
  path?: string
): Promise<OpenFileType> {
  let filePath, fileInfo: MarkFile, fileData: FileData
  if (path === undefined || path === null || path === '') {
    filePath = await fileOpenDialog()
  } else {
    filePath = path
  }

  if (filePath) {
    if (fileCache.hasOwnProperty(filePath)) {
      fileInfo = fileCache[filePath].fileInfo
      fileData = fileCache[filePath].fileData
    } else {
      try {
        fileInfo = await getMarkFile(filePath)

        const fileContent = fs.readFileSync(filePath, 'utf8')
        const parseContent = matter(fileContent)
        const headInfo = parseContent.data as HeadInfo

        fileData = {
          headInfo,
          content: parseContent.content,
          isChange: false,
          scrollPos: undefined
        }

        BrowserWindow.getFocusedWindow()?.webContents.send(
          ipcConfig.OPEN_FILE,
          { fileInfo, fileData }
        )
      } catch (err) {
        throw err
      }
    }

    BrowserWindow.getFocusedWindow()?.webContents.send(ipcConfig.OPEN_FILE, {
      fileInfo,
      fileData
    })
    return {
      fileInfo,
      fileData
    }
  }
}

export async function saveFileCallback(filePath: string) {
  try {
    BrowserWindow.getFocusedWindow()?.webContents.send(
      ipcConfig.SAVE_FILE,
      filePath
    )
  } catch (err) {
    throw err
  }
}

export async function createFileCallback(): Promise<OpenFileType> {
  const filePath = await createFileDialog()
  if (filePath) {
    const headInfo = {
      title: '',
      desc: ''
    }
    const fileInfo: MarkFile = getTempMarkFile(filePath)
    const fileData: FileData = {
      headInfo,
      content: '',
      isChange: false,
      scrollPos: undefined
    }
    BrowserWindow.getFocusedWindow()?.webContents.send(ipcConfig.OPEN_FILE, {
      fileInfo,
      fileData
    })
    return {
      fileInfo,
      fileData
    }
  }
}
