const { dialog } = require('electron')

async function openFileDialog() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [
      {
        name: 'Markdown',
        extensions: ['md']
      }
    ]
  })

  if (canceled) return undefined

  return filePaths[0]
}

async function handleEmptyFileSave() {
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters: [
      {
        name: 'Markdown',
        extensions: ['md']
      }
    ]
  })

  if (canceled) return undefined

  return filePath
}

module.exports = {
  openFileDialog,
  handleEmptyFileSave
}
