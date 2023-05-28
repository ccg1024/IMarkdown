import fs from 'fs'
import path from 'path'
import { mkdir } from 'fs/promises'
import type { MessageBoxSyncOptions } from 'electron'

interface DefaultAppDirectory {
  configDir: string
  logDir: string
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
