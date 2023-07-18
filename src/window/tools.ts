import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { mkdir, stat, readdir } from 'fs/promises'
import type { MessageBoxSyncOptions } from 'electron'

interface DefaultAppDirectory {
  configDir: string
  logDir: string
}

export type MarkFile = {
  id: string
  size: string
  time: string
  name: string
  firstLine?: string
}

export const createDirectory = async (path: string): Promise<void> => {
  try {
    if (!fs.existsSync(path)) {
      await mkdir(path, { recursive: true })
    }
  } catch (error) {
    throw error
  }
}

export const defaultAppDirectory = (): DefaultAppDirectory => {
  const home = process.env.HOME || process.env.USERPROFILE

  const configDir =
    process.platform === 'win32'
      ? `${home}\\Imarkdown`
      : `${home}/.local/state/Imarkdown`
  const logDir =
    process.platform === 'win32'
      ? `${home}\\Imarkdown\\log\\`
      : `${home}/.local/state/Imarkdown/log/`

  createDirectory(logDir)
  createDirectory(configDir)

  return { configDir, logDir }
}

export const closeMessage: MessageBoxSyncOptions = {
  type: 'info',
  buttons: ['Yes', 'No'],
  title: 'Warning',
  cancelId: 1,
  defaultId: 0,
  message: 'Exit',
  detail:
    'The app is under development, make sure everything is saved before exiting. Exit now?'
}

export function convertWindowsPathToUnixPath(filepath: string): string {
  return filepath.split(path.sep).join(path.posix.sep)
}

export function formatWin32Title(title: string): string {
  return title.replace(/^.*?\//, '')
}

export function fileCreationTime() {
  const date = new Date()
  const year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  month = month < 10 ? +`0${month}` : month
  day = day < 10 ? +`0${day}` : day

  return `${year}-${month}-${day}`
}

function getNormalSize(size: number) {
  if (size > 102400) {
    return String(Math.floor(size / 102400)) + 'MB'
  } else if (size > 1024) {
    return String(Math.floor(size / 1024)) + 'KB'
  }
  return String(size) + 'B'
}

function haveContent(str: string): boolean {
  return str !== '' && str !== '\n' && str !== '\r\n'
}

export async function getFileFirstLine(filepath: string): Promise<string> {
  const readStream = fs.createReadStream(filepath, { encoding: 'utf8' })
  const rl = readline.createInterface({ input: readStream })
  let result = ''
  let lineCnt = 0
  let frontMatterCnt = 0
  let frontMatterExp = /^---/
  let MAX_LINE = 10

  for await (const line of rl) {
    if (lineCnt >= MAX_LINE) {
      break
    }

    if (haveContent(line)) {
      if (!frontMatterExp.test(line) && frontMatterCnt === 0) {
        result = line
        break
      } else if (frontMatterCnt >= 2) {
        result = line
        break
      } else if (frontMatterExp.test(line)) {
        frontMatterCnt += 1
      }
    }

    lineCnt += 1
  }

  rl.close()
  readStream.close()
  return result
}

export async function getMarkFile(dirPath: string) {
  const markFile: MarkFile[] = []
  const filelist = await readdir(dirPath, { encoding: 'utf8' })
  for (const file of filelist) {
    const stats = await stat(path.join(dirPath, file))
    if (stats.isFile() && path.extname(file) === '.md') {
      const fileFirstLine = await getFileFirstLine(path.join(dirPath, file))
      markFile.push({
        id: path.join(dirPath, file),
        name: path.basename(file, path.extname(file)),
        time: stats.ctime.toLocaleString(),
        size: getNormalSize(stats.size),
        firstLine: fileFirstLine
      })
    }
  }

  return markFile
}

// duplicate
export function getMarkdownFile(dirPath: string): MarkFile[] {
  const filelist = fs.readdirSync(dirPath, { encoding: 'utf8' })
  const markFile: MarkFile[] = []
  filelist.forEach(file => {
    const stats = fs.statSync(path.join(dirPath, file))
    if (stats.isFile() && path.extname(file) === '.md') {
      markFile.push({
        id: path.join(dirPath, file),
        name: path.basename(file, path.extname(file)),
        time: stats.ctime.toLocaleString(),
        size: getNormalSize(stats.size)
      })
    }
  })
  return markFile
}
