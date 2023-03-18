// remove editor warn about electronAPI types
export interface IElectronAPI {
  openFile: (callback: any) => Promise<void>,
  saveFile: (callback: any) => Promise<void>,
  require: (callback: any) => Promise<void>,
  toggleView: (callback: any) => Promise<void>,
  setFilePath: (filePath: string) => Promise<void>,
  setContentChange: (isChange: boolean) => Promise<void>,
  showUnsavedInfo: () => Promise<void>,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
