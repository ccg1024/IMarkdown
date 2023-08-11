import { UpdateFileData } from '../window/menu/menu-callback'
import { VimOptionIPC } from '../config/vim-option.config'
import { ThemeModel, FileToken, ConfigFile } from '.'

export interface IElectronIPC {
  listenFileOpen: (callback: (...args) => void) => Promise<void>
  listenFileSave: (callback: (...args) => void) => Promise<void>
  listenToggleView: (callback: (...args) => void) => Promise<void>
  listenSendSaveInfo: (callback: (...args) => void) => Promise<void>
  listenFormatFile: (callback: (...args) => void) => Promise<void>
  listenOpenDir: (callback: (...args) => void) => Promise<void>

  getConfig: () => Promise<ConfigFile>
  vimOption: (option: VimOptionIPC) => Promise<void>
  initRenderer: () => Promise<FileToken>
  getPlatform: () => string

  updateDocCache: (update: UpdateFileData) => Promise<void>
  updateHeader: (update: UpdateFileData) => Promise<void>
  openRecentFile: (path: string) => Promise<void>
  openMenu: (x: number, y: number) => Promise<void>
  updateScrollPos: (update: UpdateFileData) => Promise<void>
  openDirFile: (path: string) => Promise<void>

  closeWindow: () => Promise<void>
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>

  removeFileOpenListener: () => Promise<void>
  removeFileSaveListener: () => Promise<void>
  removeToggleViewListener: () => Promise<void>
  removeSendSaveInfoListener: () => Promise<void>
  removeFormatFileListener: () => Promise<void>
  removeDirOpenListener: () => Promise<void>
}

interface IMarkdown {
  themeModel: ThemeModel
}

declare global {
  interface Window {
    ipcAPI: IElectronIPC
    imarkdown: IMarkdown
  }
}
