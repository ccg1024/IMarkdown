import { useEffect, MutableRefObject } from 'react'
import PubSub from 'pubsub-js'
import { EditorView } from '@codemirror/view'

import pubsubConfig from 'src/config/pubsub.config'
import { EditorConfig } from 'src/types'
import generateState, { themePlugin, vimPlugin } from '../libs/generate-state'
import { vim } from '@replit/codemirror-vim'
import { useColorMode } from '@chakra-ui/react'
import { imarkdownDark } from '../plugins/theme/imarkdown-dark'
import { imarkdown } from '../plugins/theme/imarkdown'

export const useEditorState = (
  containerRef: MutableRefObject<HTMLDivElement>,
  editorRef: MutableRefObject<EditorView>,
  fileRef: MutableRefObject<string>,
  dynamicPlugin: unknown
) => {
  const { colorMode } = useColorMode()
  const { current: oldFile } = fileRef
  const { current: cm } = editorRef
  const pubsubCallback = (_type: string, editorConfig: EditorConfig) => {
    // update scroll pos to main process
    if (oldFile && cm) {
      const scrollTop = cm.scrollDOM.scrollTop
      const blockInfo = cm.elementAtHeight(scrollTop)
      window.ipcAPI.updateScrollPos({
        filepath: oldFile,
        fileData: {
          scrollPos: blockInfo.from
        }
      })
    }
    // re-assign
    fileRef.current = editorConfig.file
    const view = new EditorView({
      state: generateState(editorConfig.doc),
      parent: containerRef.current
    })

    // distroy old one
    if (editorRef.current) {
      editorRef.current.destroy()
    }

    if (dynamicPlugin.vim) {
      view.dispatch({
        effects: vimPlugin.reconfigure(vim())
      })
    }

    if (colorMode === 'dark') {
      view.dispatch({
        effects: themePlugin.reconfigure(imarkdownDark)
      })
    } else {
      view.dispatch({
        effects: themePlugin.reconfigure(imarkdown)
      })
    }

    if (editorConfig.scrollPos) {
      view.dispatch({
        effects: EditorView.scrollIntoView(editorConfig.scrollPos, {
          y: 'start'
        })
      })
    }
  }
  useEffect(() => {
    const token = PubSub.subscribe(
      pubsubConfig.UPDATE_EDITOR_STATE,
      pubsubCallback
    )
    return () => {
      PubSub.unsubscribe(token)
    }
  }, [colorMode])
}
