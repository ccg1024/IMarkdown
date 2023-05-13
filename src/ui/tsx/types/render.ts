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

export interface HeadInfo {
  date?: string
  desc?: string
  title?: string
}
