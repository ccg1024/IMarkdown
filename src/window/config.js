const fs = require('fs')
const { mkdir } = require('fs/promises')

// create cache dir
const createFolder = async path => {
  try {
    if (!fs.existsSync(path)) {
      await mkdir(path, { recursive: true })
    }
  } catch (error) {
    console.log(error.message)
  }
}

const generatorPath = () => {
  const HOME_PTATH =
    process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME

  const configPath =
    process.platform === 'win32'
      ? HOME_PTATH + '\\Imarkdown'
      : HOME_PTATH + '/.local/state/Imarkdown'

  const logPath =
    process.platform === 'win32'
      ? HOME_PTATH + '\\Imarkdown\\log\\'
      : HOME_PTATH + '/.local/state/Imarkdown/log/'

  createFolder(logPath)

  return { configPath, logPath }
}

const closeMessageConfig = {
  type: 'info',
  buttons: ['Yes', 'No'],
  title: 'Warning',
  cancelId: 1,
  defaultId: 0,
  detail:
    'The app is under development, make sure everything is saved before exiting. Exit now?'
}

const fileUnsaveMessageConfig = {
  type: 'info',
  buttons: ['Yes', 'No'],
  title: 'Warning',
  cancelId: 1,
  defaultId: 0,
  detail: 'current file is changed, and not save yet. Return to save File?'
}

module.exports = {
  generatorPath,
  closeMessageConfig,
  fileUnsaveMessageConfig
}
