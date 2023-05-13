import { HeadInfo } from './ui/tsx/types/render'

// remove editor warn about electronAPI types
export interface IElectronAPI {
  openFile: (callback: any) => Promise<void>
  saveFile: (callback: any) => Promise<void>
  require: (callback: any) => Promise<void>
  toggleView: (callback: any) => Promise<void>
  setFilePath: (filePath: string) => Promise<void>
  setContentChange: (isChange: boolean) => Promise<void>
  showUnsavedInfo: () => Promise<void>
  removeSaveFile: () => Promise<void>
  removeOpenFile: () => Promise<void>
  removeToggleView: () => Promise<void>
  getConfigPath: () => Promise<void>
  openRecentFile: (filePath: string) => Promise<void>
  sendSavedInfo: (callback: any) => Promise<void>
  removeSendSavedInfo: () => Promise<void>
  vimOption: (option: string) => Promise<void>
  updateCache: (cache: string) => Promise<void>
  initialedRender: () => Promise<void>
  updateHeadInfo: (headInfo: HeadInfo) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
