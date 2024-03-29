// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import ipcConfig from './config/ipc.config'
import { VimOptionIPC } from './config/vim-option.config'
import {
  UpdateFileData,
  ConfigFile,
  OpenFileType,
  GitPipelineIn,
  GitPipelineOut
} from 'src/types'

// eslint-disable-next-line
type CallbackFunction = (event: IpcRendererEvent, ...args: any[]) => void

// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld('ipcAPI', {
  listenFileOpen: (callback: CallbackFunction) => {
    ipcRenderer.on(ipcConfig.OPEN_FILE, callback)
  },
  listenFileSave: (callback: CallbackFunction) => {
    ipcRenderer.on(ipcConfig.SAVE_FILE, callback)
  },
  listenToggleView: (callback: CallbackFunction) => {
    ipcRenderer.on(ipcConfig.TOGGLE_VIEW, callback)
  },
  listenSendSaveInfo: (callback: CallbackFunction) => {
    ipcRenderer.on(ipcConfig.SEND_SAVE_INFO, callback)
  },
  listenFormatFile: (callback: CallbackFunction) => {
    ipcRenderer.on(ipcConfig.FORMAT_FILE, callback)
  },
  listenOpenDir: (callback: CallbackFunction) => {
    ipcRenderer.on(ipcConfig.OPEN_DIR, callback)
  },

  getConfig: (): Promise<ConfigFile> => {
    return ipcRenderer.invoke(ipcConfig.GET_CONFIG)
  },
  vimOption: (option: VimOptionIPC) => {
    ipcRenderer.invoke(ipcConfig.VIM_OPTION, option)
  },
  initRenderer: (): Promise<OpenFileType> => {
    return ipcRenderer.invoke(ipcConfig.INIT_RENDERER)
  },
  getPlatform: (): string => process.platform,
  getVersion: (): Promise<string> => {
    return ipcRenderer.invoke(ipcConfig.GET_VERSION)
  },
  gitPipeline: (input: GitPipelineIn): Promise<GitPipelineOut> => {
    return ipcRenderer.invoke(ipcConfig.GIT_PIPELINE, input)
  },

  updateDocCache: (update: UpdateFileData) => {
    ipcRenderer.send(ipcConfig.UPDATE_DOC_CACHE, update)
  },
  updateHeader: (update: UpdateFileData) => {
    ipcRenderer.send(ipcConfig.UPDATE_HEADER, update)
  },
  openRecentFile: (path: string) => {
    ipcRenderer.send(ipcConfig.OPEN_RECENT_FILE, path)
  },
  openMenu: (x: number, y: number) => {
    ipcRenderer.send(ipcConfig.SHOW_MENU, { x, y })
  },
  updateScrollPos: (update: UpdateFileData) => {
    ipcRenderer.send(ipcConfig.UPDATE_SCROLL_POS, update)
  },
  openDirFile: (path: string) => {
    ipcRenderer.send(ipcConfig.DIR_ITEM_CLICK, path)
  },

  closeWindow: () => {
    ipcRenderer.send(ipcConfig.CLOSE_WINDOW)
  },
  minimizeWindow: () => {
    ipcRenderer.send(ipcConfig.MINIMIZE_WINDOW)
  },
  maximizeWindow: () => {
    ipcRenderer.send(ipcConfig.MAXIMIZE_WINDOW)
  },

  removeFileOpenListener: () => {
    ipcRenderer.removeAllListeners(ipcConfig.OPEN_FILE)
  },
  removeFileSaveListener: () => {
    ipcRenderer.removeAllListeners(ipcConfig.SAVE_FILE)
  },
  removeToggleViewListener: () => {
    ipcRenderer.removeAllListeners(ipcConfig.TOGGLE_VIEW)
  },
  removeSendSaveInfoListener: () => {
    ipcRenderer.removeAllListeners(ipcConfig.SEND_SAVE_INFO)
  },
  removeFormatFileListener: () => {
    ipcRenderer.removeAllListeners(ipcConfig.FORMAT_FILE)
  },
  removeDirOpenListener: () => {
    ipcRenderer.removeAllListeners(ipcConfig.OPEN_DIR)
  }
})
