import fs from 'fs'
import matter from 'gray-matter'
import { BrowserWindow } from 'electron'

import { FileCache } from '../../types/main'
import ipcConfig from '../../config/ipc.config'
import { fileOpenDialog, createFileDialog, dirOpenDialog } from '../dialog'
import { fileCreationTime, getMarkdownFile } from '../tools'

export async function dirOpenCallback() {
  const dirPath = await dirOpenDialog()

  if (dirPath) {
    try {
      const markFile = getMarkdownFile(dirPath)
      BrowserWindow.getFocusedWindow()?.webContents.send(
        ipcConfig.OPEN_DIR,
        markFile
      )
    } catch (err) {
      throw err
    }
  }
}

export async function fileOpenCallback(fileCache: FileCache) {
  const filePath = await fileOpenDialog()

  if (filePath) {
    if (fileCache.hasOwnProperty(filePath)) {
      BrowserWindow.getFocusedWindow()?.webContents.send(
        ipcConfig.OPEN_FILE,
        filePath,
        fileCache[filePath].fileContent,
        fileCache[filePath].headInfo,
        fileCache[filePath].isChange,
        fileCache[filePath].scrollPos
      )

      return { filePath }
    } else {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const parseContent = matter(fileContent)

        BrowserWindow.getFocusedWindow()?.webContents.send(
          ipcConfig.OPEN_FILE,
          filePath,
          parseContent.content,
          parseContent.data,
          false
        )

        return {
          filePath,
          fileContent: parseContent.content,
          headInfo: parseContent.data,
          isChange: false
        }
      } catch (err) {
        throw err
      }
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

export async function createFileCallback() {
  const filePath = await createFileDialog()
  if (filePath) {
    const createTime = fileCreationTime()
    const headInfo = {
      title: '',
      date: createTime,
      desc: ''
    }
    BrowserWindow.getFocusedWindow()?.webContents.send(
      ipcConfig.OPEN_FILE,
      filePath,
      '',
      headInfo,
      false
    )
    return {
      filePath,
      fileContent: '',
      headInfo,
      isChange: false
    }
  }
}
