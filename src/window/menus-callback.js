const fs = require('fs')
const path = require('path')
const { dialog } = require('electron')
const ipcChannel = require('../config/backend')
const { fileUnsaveMessageConfig } = require('./config')
const { openFileDialog, handleEmptyFileSave } = require('./dialog')
const { logTime, converWin32Path } = require('../utils/backend')

const ifSkipOpenFile = isChange => {
  let skip = false
  if (isChange) {
    let response = dialog.showMessageBoxSync(null, fileUnsaveMessageConfig)
    if (response === 0) {
      skip = true
    }
  }
  return skip
}

async function openFileCallback(win, openedCache) {
  const filePath = await openFileDialog()

  if (filePath) {
    if (Object.hasOwn(openedCache, converWin32Path(filePath))) {
      win.webContents.send(
        ipcChannel.openFileChannel,
        converWin32Path(filePath),
        openedCache[converWin32Path(filePath)].fileContent,
        path.basename(filePath),
        openedCache[converWin32Path(filePath)].isChange
      )
      return {
        filePath: converWin32Path(filePath)
      }
    } else {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8')
        win.webContents.send(
          ipcChannel.openFileChannel,
          converWin32Path(filePath),
          fileContent,
          path.basename(filePath),
          false
        )

        return {
          filePath: converWin32Path(filePath),
          fileContent,
          isChange: false
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}

async function saveFileCallback(win, openedFile, logPath) {
  try {
    if (openedFile === '') {
      let tempFilePath = await handleEmptyFileSave()

      if (tempFilePath) {
        win.webContents.send(
          ipcChannel.saveFileChannel,
          converWin32Path(tempFilePath),
          0
        )

        const saveLogTime = logTime()
        fs.appendFile(
          logPath + 'imarkdown.log',
          '[saveEmptyFile] ' + tempFilePath + ' ' + saveLogTime + '\n',
          'utf8',
          err => {
            if (err) throw err
          }
        )
      }
    } else {
      const saveLogTime = logTime()
      fs.appendFile(
        logPath + 'imarkdown.log',
        '[saveFile] ' + openedFile + ' ' + saveLogTime + '\n',
        'utf8',
        err => {
          if (err) throw err
        }
      )
      win.webContents.send(
        ipcChannel.saveFileChannel,
        converWin32Path(openedFile),
        1
      )
    }
  } catch (err) {
    const saveLogTime = logTime()
    fs.appendFile(
      logPath + 'imarkdown.log',
      '[Error] ' + err + ' ' + saveLogTime + '\n',
      'utf8',
      err => {
        if (err) throw err
      }
    )
  }
}

async function createFileCallback(win) {
  let tempFilePath = await handleEmptyFileSave()
  if (tempFilePath) {
    win.webContents.send(
      ipcChannel.openFileChannel,
      converWin32Path(tempFilePath),
      '',
      path.basename(tempFilePath),
      false
    )
    return {
      filePath: converWin32Path(tempFilePath),
      fileContent: '',
      isChange: false
    }
  }
}

module.exports = {
  openFileCallback: openFileCallback,
  saveFileCallback: saveFileCallback,
  createFileCallback: createFileCallback
}
