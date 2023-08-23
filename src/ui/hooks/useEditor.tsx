import PubSub from 'pubsub-js'
import { useState, useLayoutEffect, useEffect, MutableRefObject } from 'react'
import { EditorView } from '@codemirror/view'
import { vim } from '@replit/codemirror-vim'
import { useColorMode } from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import pubsubConfig from 'src/config/pubsub.config'
import { LiveScroll } from 'src/types'
import generateState, { themePlugin, vimPlugin } from '../libs/generate-state'
import { imarkdownDark } from '../plugins/theme/imarkdown-dark'
import { imarkdown } from '../plugins/theme/imarkdown'
import { ImarkdownPlugin } from 'src/config/plugin-list.config'
import { selectFilepath } from '../app/reducers/currentFileSlice'
import { getDoc, getScrollPos } from '../app/store'

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
  const filepath = useSelector(selectFilepath)
  const [editor, setEditor] = useState<EditorView>(null)
  const { colorMode } = useColorMode()

  window.imarkdown.themeModel = colorMode

  // create new editor when file path change
  useLayoutEffect(() => {
    if (filepath) {
      const view = new EditorView({
        state: generateState(getDoc()),
        parent: containerRef.current
      })

      if (dynamicPlugin.vim) {
        view.dispatch({
          effects: vimPlugin.reconfigure(vim())
        })
      }

      const scrollPos = getScrollPos()
      if (scrollPos) {
        view.dispatch({
          effects: EditorView.scrollIntoView(scrollPos, { y: 'start' })
        })
      }

      setEditor(view)

      return () => {
        view.destroy()
      }
    }
  }, [filepath])

  useLayoutEffect(() => {
    if (editor) {
      if (colorMode === 'dark') {
        editor.dispatch({
          effects: themePlugin.reconfigure(imarkdownDark)
        })
      } else {
        editor.dispatch({
          effects: themePlugin.reconfigure(imarkdown)
        })
      }
    }
  }, [colorMode, editor])

  useSyncScrollFromPreview(editor)
  useDynamicPluginConfig()
  usePluginEvent(editor)

  return editor
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
const usePluginEvent = (editor: EditorView) => {
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
  }, [editor])
}

/**
 * Synchronize scrolling triggered from preview
 *
 * @param editorRef A ref which refer to codemirror instance
 */
const useSyncScrollFromPreview = (editor: EditorView) => {
  const callback = (_type: string, scrollInfo: LiveScroll) => {
    if (editor && !editor.hasFocus) {
      const blockInfo = editor.lineBlockAt(
        editor.state.doc.line(scrollInfo.line).from
      )

      if (!editor.inView) {
        editor.dispatch({
          effects: EditorView.scrollIntoView(blockInfo.from, { y: 'start' })
        })
      } else {
        const scrollTop = blockInfo.top + blockInfo.height * scrollInfo.percent
        editor.scrollDOM.scrollTo({ top: scrollTop, behavior: 'smooth' })
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
  }, [editor])
}
