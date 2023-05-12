export interface IScrollPosInfo {
  previewScrollTo: number
  previewScrollTop: number
  editorScrollTo: number
}

export interface IRecentFiles {
  [key: string]: {
    filename: string
    isChange: string
  }
}
