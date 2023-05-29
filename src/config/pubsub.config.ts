const pubsubConfig = {
  // for main process and renderer process
  SAVE_FILE: 'save_file',
  UPDATE_EDITOR_STATE: 'update_editor_state',
  UPDATE_DOCUMENT_TO_MAIN: 'update_document_to_main',

  // for conponent communication to share data
  STATUS_LINE_INFO: 'status_line_info',
  UPDATE_STATUS_LINE: 'update_status_line',
  CLEAR_STATUS_LINE: 'clear_status_line',
  UPDATE_DYNAMIC_PLUGINS: 'update_dynamic_plugins',

  // for sync scroll between editor and preview
  SYNC_SCROLL_TO_LIVE_PREVIEW: 'sync_scroll_to_live_preview',
  SYNC_SCROLL_FROM_PREVIEW: 'sync_scroll_from_preview',

  // for editor extension to sync data with other components
  UPDATE_PADDING_BOTTOM: 'update_padding_bottom'
}

export default pubsubConfig
