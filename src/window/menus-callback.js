const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const { dialog } = require('electron')
const ipcChannel = require('../config/backend')
const { fileUnsaveMessageConfig } = require('./config')
const { openFileDialog, handleEmptyFileSave } = require('./dialog')
const { logTime, converWin32Path } = require('../utils/backend')

const createFileTime = () => {
  const currentTime = new Date()
  const year = currentTime.getFullYear()
  const month =
    currentTime.getMonth() + 1 > 9
      ? currentTime.getMonth() + 1
      : '0' + (currentTime.getMonth() + 1)
  const day =
    currentTime.getDate() > 9
      ? currentTime.getDate()
      : '0' + currentTime.getDate()

  return [year, month, day].join('-')
}

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
        openedCache[converWin32Path(filePath)].headInfo,
        openedCache[converWin32Path(filePath)].isChange
      )
      return {
        filePath: converWin32Path(filePath)
      }
    } else {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const parsContent = matter(fileContent)
        win.webContents.send(
          ipcChannel.openFileChannel,
          converWin32Path(filePath),
          parsContent.content,
          parsContent.data,
          false
        )

        return {
          filePath: converWin32Path(filePath),
          fileContent: parsContent.content,
          headInfo: parsContent.data,
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
    const createTime = createFileTime()
    const headInfo = {
      title: '',
      date: createTime,
      desc: ''
    }
    win.webContents.send(
      ipcChannel.openFileChannel,
      converWin32Path(tempFilePath),
      '',
      headInfo,
      false
    )
    return {
      filePath: converWin32Path(tempFilePath),
      fileContent: '',
      headInfo,
      isChange: false
    }
  }
}

module.exports = {
  openFileCallback: openFileCallback,
  saveFileCallback: saveFileCallback,
  createFileCallback: createFileCallback
}
