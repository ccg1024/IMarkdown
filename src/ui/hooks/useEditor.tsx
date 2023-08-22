import PubSub from 'pubsub-js'
import { useEffect, MutableRefObject, useRef } from 'react'
import { EditorView } from '@codemirror/view'
import { vim } from '@replit/codemirror-vim'
import { useColorMode } from '@chakra-ui/react'

import pubsubConfig from 'src/config/pubsub.config'
import { EditorConfig, LiveScroll } from 'src/types'
import generateState, { themePlugin, vimPlugin } from '../libs/generate-state'
import { imarkdownDark } from '../plugins/theme/imarkdown-dark'
import { imarkdown } from '../plugins/theme/imarkdown'
import { ImarkdownPlugin } from 'src/config/plugin-list.config'

const dynamicPlugin: ImarkdownPlugin = {
  vim: false
}

/**
 * Destroy old one and create a new codemirror instance when receive a file open message
 * and re-assign editorRef, fileRef
 *
 * @param containerRef The container ref which place the codemirror instance
 */
export const useEditor = (containerRef: MutableRefObject<HTMLDivElement>) => {
  const editorRef = useRef<EditorView>(null)
  const fileRef = useRef<string>('')
  const { colorMode } = useColorMode()
  const pubsubCallback = (_type: string, editorConfig: EditorConfig) => {
    // update scroll pos to main process
    if (fileRef.current && editorRef.current) {
      const scrollTop = editorRef.current.scrollDOM.scrollTop
      const blockInfo = editorRef.current.elementAtHeight(scrollTop)
      window.ipcAPI.updateScrollPos({
        filepath: fileRef.current,
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

  useEffect(() => {
    if (editorRef.current) {
      if (colorMode === 'dark') {
        editorRef.current.dispatch({
          effects: themePlugin.reconfigure(imarkdownDark)
        })
      } else {
        editorRef.current.dispatch({
          effects: themePlugin.reconfigure(imarkdown)
        })
      }
    }
  }, [colorMode])

  useSyncScrollFromPreview(editorRef)
  useDynamicPluginConfig()
  usePluginEvent(editorRef)

  return { editorRef, fileRef }
}

/**
 * Recorde whether dynamic plugins are enabled
 */
const useDynamicPluginConfig = () => {
  const pubsubCallback = (_type: string, plugin: ImarkdownPlugin) => {
    let key: keyof ImarkdownPlugin
    for (key in plugin) {
      dynamicPlugin[key] = plugin[key]
    }
  }
  useEffect(() => {
    const token = PubSub.subscribe(
      pubsubConfig.UPDATE_DYNAMIC_PLUGINS,
      pubsubCallback
    )
    return () => {
      PubSub.unsubscribe(token)
    }
  }, [])
}

/**
 * Receive re-act message which send from plugin
 *
 * @param editorRef A ref which refer to codemirror instance
 */
const usePluginEvent = (editorRef: MutableRefObject<EditorView>) => {
  const { current: editor } = editorRef
  const headNavFn = (_type: string, headAnchor: number) => {
    if (editor && headAnchor) {
      const line = editor.state.doc.line(headAnchor)
      editor.dispatch({
        selection: { anchor: line.from, head: line.from },
        effects: EditorView.scrollIntoView(line.from, { y: 'start' })
      })
    }
  }
  useEffect(() => {
    const token = PubSub.subscribe(pubsubConfig.EXECUTE_HEAD_NAV, headNavFn)
    return () => {
      PubSub.unsubscribe(token)
    }
  }, [])
}

/**
 * Synchronize scrolling triggered from preview
 *
 * @param editorRef A ref which refer to codemirror instance
 */
const useSyncScrollFromPreview = (editorRef: MutableRefObject<EditorView>) => {
  const callback = (_type: string, scrollInfo: LiveScroll) => {
    if (editorRef.current && !editorRef.current.hasFocus) {
      const cm = editorRef.current
      const blockInfo = cm.lineBlockAt(cm.state.doc.line(scrollInfo.line).from)

      if (!cm.inView) {
        cm.dispatch({
          effects: EditorView.scrollIntoView(blockInfo.from, { y: 'start' })
        })
      } else {
        const scrollTop = blockInfo.top + blockInfo.height * scrollInfo.percent
        // cm.scrollDOM.scrollTop = scrollTop
        cm.scrollDOM.scrollTo({ top: scrollTop, behavior: 'smooth' })
      }
    }
  }
  useEffect(() => {
    const token = PubSub.subscribe(
      pubsubConfig.SYNC_SCROLL_FROM_PREVIEW,
      callback
    )
    return () => {
      PubSub.unsubscribe(token)
    }
  }, [])
}
