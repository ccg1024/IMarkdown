import { app, ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
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
import { fileOpenCallback } from './menu/menu-callback'
import { existProp } from './tools'

import { UpdateFileData, SaveToken, ConfigFile, GitPipelineIn } from 'src/types'
import { Git } from './git'

export function mountIPC() {
  const { logDir, logName, configDir, configName } = touchEnvName()
  // create a git operation instance
  const git = new Git()

  ipcMain.handle(ipcConfig.GET_CONFIG, handleAppConfig)
  ipcMain.handle(ipcConfig.INIT_RENDERER, handleTouchFile)
  ipcMain.handle(ipcConfig.GET_VERSION, handleGetVersion)
  ipcMain.handle(ipcConfig.GIT_PIPELINE, handleGitPipeline)

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

  async function handleGitPipeline(
    _event: IpcMainInvokeEvent,
    input: GitPipelineIn
  ) {
    const { type, cwd } = input
    let called
    switch (type) {
      case 'head':
        called = await git.getHead({ cwd: path.dirname(cwd) })
        break
      case 'pull':
        called = await git.pull({ cwd: path.dirname(cwd) })
        break
      case 'push':
        called = await git.push({ cwd: path.dirname(cwd) })
        break
      case 'abort':
        called = git.abortExec()
        break
    }
    return {
      type,
      out: called
    }
  }

  async function handleGetVersion() {
    return app.getVersion()
  }

  async function handleAppConfig() {
    const fileContent = fs.readFileSync(
      path.join(configDir, configName),
      'utf8'
    )
    return JSON.parse(fileContent) as ConfigFile
  }

  function log(filepath: string) {
    return `[LOG] ${new Date().toLocaleString()} - ${filepath} - save content\n`
  }

  async function handleContentSave(_e: IpcMainEvent, saveToken: SaveToken) {
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

  async function handleDirItemClick(_e: IpcMainEvent, filepath: string) {
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
  async function handleRencentFile(_: IpcMainEvent, filepath: string) {
    const fileCacheItem = touchFileCacheItem(filepath)

    if (fileCacheItem) {
      touchWin()?.webContents.send(ipcConfig.OPEN_FILE, { ...fileCacheItem })
      setCurrentFile(filepath)
    }
  }
  async function handleUpdateDoc(_: IpcMainEvent, update: UpdateFileData) {
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
  async function handleUpdateHeader(_: IpcMainEvent, update: UpdateFileData) {
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
  async function handleUpdateScroll(_: IpcMainEvent, update: UpdateFileData) {
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
