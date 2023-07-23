export type HeadInfo = {
  desc?: string
  title?: string
  tag?: Array
}

// duplicated
export interface FileCache extends Object {
  [key: string]: {
    fileContent: string
    headInfo: HeadInfo
    isChange: boolean
    scrollPos?: number
  }
}
