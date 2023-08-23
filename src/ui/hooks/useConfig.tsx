import PubSub from 'pubsub-js'
import { useLayoutEffect } from 'react'

import imardownPlugins from 'src/config/plugin-list.config'
import pubsubConfig from 'src/config/pubsub.config'
import { ConfigFile } from 'src/types'

/**
 * A hook that get config file and set to right place
 */
export const useConfig = () => {
  useLayoutEffect(() => {
    window.ipcAPI.getConfig().then((settings: ConfigFile) => {
      const editor = document.querySelector('#editor_box') as HTMLDivElement
      const root = document.querySelector('#content_root') as HTMLDivElement

      for (const name in settings) {
        switch (name) {
          case 'fontSize':
            root.style.fontSize = settings[name]
            break
          case 'editorFontFamily':
            editor.style.fontFamily = settings[name]
            break
          case 'previewFontFamily':
            root.style.fontFamily = settings[name]
            break
          case 'vimSupport':
            PubSub.publish(pubsubConfig.UPDATE_DYNAMIC_PLUGINS, {
              [imardownPlugins.VIM]: settings[name]
            })
            break
        }
      }
    })
  }, [])
}
