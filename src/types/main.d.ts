export interface HeadInfo {
  date?: string
  desc?: string
  title?: string
}

export interface FileCache extends Object {
  [key: string]: {
    fileContent: string
    headInfo: HeadInfo
    isChange: boolean
  }
}
