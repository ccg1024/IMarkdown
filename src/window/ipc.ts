import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'

import {
  touchEnvName,
  touchFileCacheItem,
  updateFileCache,
  touchWin,
  setCurrentFile,
  hasCache
} from 'src/index'
import ipcConfig from 'src/config/ipc.config'
import { fileOpenCallback, UpdateFileData } from './menu/menu-callback'
import { existProp } from './tools'
import { HeadInfo } from 'src/types/main'

export type SaveToken = {
  headInfo: HeadInfo
  content: string
  doc: string
  filepath: string
}

export function mountIPC() {
  const { logDir, logName, configDir, configName } = touchEnvName()

  ipcMain.handle(ipcConfig.GET_CONFIG, handleAppConfig)
  ipcMain.handle(ipcConfig.INIT_RENDERER, handleTouchFile)

  // listen info from renderer
  ipcMain.on(ipcConfig.SAVE_CONTENT, handleContentSave)
  ipcMain.on(ipcConfig.DIR_ITEM_CLICK, handleDirItemClick)
  ipcMain.on(ipcConfig.OPEN_RECENT_FILE, handleRencentFile)
  ipcMain.on(ipcConfig.UPDATE_DOC_CACHE, handleUpdateDoc)
  ipcMain.on(ipcConfig.UPDATE_HEADER, handleUpdateHeader)
  ipcMain.on(ipcConfig.UPDATE_SCROLL_POS, handleUpdateScroll)
  ipcMain.on(ipcConfig.CLOSE_WINDOW, handleCloseWindow)
  ipcMain.on(ipcConfig.MINIMIZE_WINDOW, handleMinWindow)
  ipcMain.on(ipcConfig.MAXIMIZE_WINDOW, handleMaxWindow)

  async function handleAppConfig() {
    try {
      return fs.readFileSync(path.join(configDir, configName), 'utf8')
    } catch (err) {
      throw err
    }
  }

  function log(filepath: string) {
    return `[LOG] ${new Date().toLocaleString()} - ${filepath} - save content\n`
  }

  async function handleContentSave(_e: any, saveToken: SaveToken) {
    const { filepath, headInfo, content, doc } = saveToken
    fs.writeFile(filepath, content, err => {
      if (err) throw err
    })
    fs.appendFile(path.join(logDir, logName), log(filepath), 'utf8', err => {
      if (err) throw err
    })

    // NOTE: update file cache after save file
    updateFileCache(filepath, {
      fileData: {
        content: doc,
        headInfo: headInfo,
        isChange: false
      }
    })
  }

  async function handleDirItemClick(_e: any, filepath: string) {
    if (filepath) {
      fileOpenCallback(filepath)
        .then(file => {
          if (file) {
            touchWin()?.webContents.send(ipcConfig.OPEN_FILE, { ...file })
            setCurrentFile(filepath)
          }
        })
        .catch(err => {
          throw err
        })
    }
  }
  async function handleRencentFile(_: any, filepath: string) {
    const fileCacheItem = touchFileCacheItem(filepath)

    if (fileCacheItem) {
      touchWin()?.webContents.send(ipcConfig.OPEN_FILE, { ...fileCacheItem })
      setCurrentFile(filepath)
    }
  }
  async function handleUpdateDoc(_: any, update: UpdateFileData) {
    const { filepath, fileData } = update
    const cached = hasCache(filepath)
    if (filepath && existProp(fileData, 'content') && cached) {
      updateFileCache(filepath, {
        fileData: {
          content: fileData.content,
          isChange: true
        }
      })
    }
  }
  async function handleUpdateHeader(_: any, update: UpdateFileData) {
    const { filepath, fileData } = update
    const cached = hasCache(filepath)
    if (filepath && existProp(fileData, 'headInfo') && cached) {
      updateFileCache(filepath, {
        fileData: {
          headInfo: fileData.headInfo,
          isChange: true
        }
      })
    }
  }
  async function handleUpdateScroll(_: any, update: UpdateFileData) {
    const { filepath, fileData } = update
    const cached = hasCache(filepath)
    if (filepath && existProp(fileData, 'scrollPos') && cached) {
      updateFileCache(filepath, {
        fileData: {
          scrollPos: fileData.scrollPos
        }
      })
    }
  }
  async function handleCloseWindow() {
    touchWin()?.close()
  }
  async function handleMinWindow() {
    touchWin()?.minimize()
  }
  async function handleMaxWindow() {
    const win = touchWin()
    if (win?.isMaximized()) {
      win?.unmaximize()
    } else {
      win?.maximize()
    }
  }
  async function handleTouchFile() {
    // TODO: open imarkdown by click file
  }
}
