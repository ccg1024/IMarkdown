// setting ipc channle name
const options = {
  openFileChannel: 'open-file',
  saveFileChannel: 'save-file',
  toggleViewChannel: 'toggle-view',
  setIsChangeChannel: 'set-is-change',
  showUnsaveChannel: 'show-unsaved-info',
  configPathChannel: 'get-config-path',
  updateFilePathChannel: 'set-open-file-path',
  reciveContentChannel: 'recieve-file-content',
  openRecentFile: 'open-recent-file',
  sendSavedInfo: 'send-saved-info-to-renderer',
  vimOptionChannel: 'vim-option-channel',
  updateCacheFromReact: 'update-cache-from-react',
  initialedRender: 'initialed-renderer',
  updateHeadInfoFromReact: 'update-head-info-from-react'
}

module.exports = options
