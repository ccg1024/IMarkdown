const ipcConfig = {
  // for main process and renderer process
  OPEN_FILE: 'open_file', //openFileChannel
  SAVE_FILE: 'save_file', //saveFileChannel
  TOGGLE_VIEW: 'toggle_view', //toggleViewChannel
  SEND_SAVE_INFO: 'send_save_info', //sendSavedInfo
  FORMAT_FILE: 'format_file',
  OPEN_DIR: 'open_dir',

  GET_CONFIG: 'get_config', //configPathChannel
  VIM_OPTION: 'vim_option', //vimOptionChannel
  INIT_RENDERER: 'init_renderer', //initialedRender
  GET_VERSION: 'get_version',
  GIT_PIPELINE: 'git_pipeline',

  SAVE_CONTENT: 'save_content', //reciveContentChannel
  UPDATE_DOC_CACHE: 'update_doc_cache', //updateCacheFromReact
  UPDATE_HEADER: 'update_header', //updateHeadInfoFromReact
  OPEN_RECENT_FILE: 'open_recent_file', //openRecentFile
  CLOSE_WINDOW: 'close_window', //closeWindowFromReact
  MINIMIZE_WINDOW: 'minimize_window', //minimizeWindowFromReact
  MAXIMIZE_WINDOW: 'maximize_window', //maximizeWindowFromReact
  SHOW_MENU: 'show_menu',
  UPDATE_SCROLL_POS: 'update_scroll_pos',
  DIR_ITEM_CLICK: 'dir_item_click'
}

export default ipcConfig
