import { dialog } from 'electron'
import { convertWindowsPathToUnixPath } from './tools'

export async function fileOpenDialog(): Promise<string | null> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'Markdown', extensions: ['md'] }]
  })

  if (canceled) return null

  return convertWindowsPathToUnixPath(filePaths[0])
}

export async function createFileDialog(): Promise<string | null> {
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters: [{ name: 'Markdown', extensions: ['md'] }]
  })

  if (canceled) return null

  return convertWindowsPathToUnixPath(filePath)
}
