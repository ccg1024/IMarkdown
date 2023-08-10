import { UpdateFileData } from '../window/menu/menu-callbakc'
import { VimOptionIPC } from '../config/vim-option.config'
import { HeadInfo } from './main'

export interface IElectronIPC {
  listenFileOpen: (callback: Function) => Promise<void>
  listenFileSave: (callback: Function) => Promise<void>
  listenToggleView: (callback: Function) => Promise<void>
  listenSendSaveInfo: (callback: Function) => Promise<void>
  listenFormatFile: (callback: Function) => Promise<void>
  listenOpenDir: (callback: Function) => Promise<void>

  getConfig: () => Promise<any>
  vimOption: (option: VimOptionIPC) => Promise<void>
  initRenderer: () => Promise<any>
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

const themeModels = ['light', 'dark'] as const
export type ThemeModel = (typeof themeModels)[number]

interface IMarkdown {
  themeModel: ThemeModel
}

declare global {
  interface Window {
    ipcAPI: IElectronIPC
    imarkdown: IMarkdown
  }
}

export interface ScrollPosRef {
  editorScrollTo: number
  previewScrollTo: number
  scrollTopOfPreview: number
}

export interface LineOfStatusLine {
  current: number
  total: number
}

export interface LiveScroll {
  line: number
  percent: number
}

export interface EditorConfig {
  doc: string
  file: string
  scrollPos?: number
}
