/**
 * resolve all type/interface that need import/export
 * @author crazycodegame
 */

export type HeadInfo<T> = {
  desc?: string
  title?: string
  tag?: Array<T>
}

const themeModels = ['light', 'dark'] as const
export type ThemeModel = (typeof themeModels)[number]

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

// using for initRender function
export interface FileToken {
  fullpath: string
  fileContent: string
  headInfo: HeadInfo<string>
}

// for config file type
export type ConfigFile = {
  fontSize: string
  editorFontFamily: string
  previewFontFamily: string
  vimSupport: boolean
}

// file system description
export type MarkFile = {
  id: string // absolute path of file
  size: string
  time: string
  name: string
  firstLine?: string
}

export type FileData = {
  headInfo: HeadInfo<string>
  content: string
  isChange: boolean
  scrollPos?: number
}

export type OpenFileType = {
  fileInfo: MarkFile
  fileData: FileData
}

export type UpdateFileType = {
  fileInfo?: Partial<MarkFile>
  fileData?: Partial<FileData>
}

export type UpdateFileData = {
  filepath: string
  fileData: Partial<Omit<FileData, 'isChange'>>
}

export type FileCache = {
  [key: string]: OpenFileType
} & Record<string, unknown>

export type SaveToken = {
  headInfo: HeadInfo<string>
  content: string
  doc: string
  filepath: string
}

const gitTypes = ['head', 'pull', 'push', 'abort', 'command'] as const
export type GitType = (typeof gitTypes)[number]

export type GitPipelineIn = {
  type: GitType
  cwd?: string
  command?: string
}

export type GitPipelineOut = {
  type: GitType
  out: string
} & Record<string, unknown>
