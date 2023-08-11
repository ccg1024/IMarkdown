import PubSub from 'pubsub-js'
import { Box, useColorMode } from '@chakra-ui/react'
import { EditorView } from '@codemirror/view'
import {
  useRef,
  useEffect,
  useCallback,
  UIEvent,
  ForwardRefRenderFunction,
  forwardRef,
  useImperativeHandle
} from 'react'
import { vim } from '@replit/codemirror-vim'

import { LiveScroll, EditorConfig } from 'src/types'
import pubsubConfig from 'src/config/pubsub.config'
import imardownPlugins, { ImarkdownPlugin } from 'src/config/plugin-list.config'
import generateState, { vimPlugin, themePlugin } from '../libs/generate-state'
import { imarkdown } from '../plugins/theme/imarkdown'
import { imarkdownDark } from '../plugins/theme/imarkdown-dark'

interface EditorProps {
  isVisible: boolean
}
interface Controller {
  scrollBarTimer: NodeJS.Timeout | null
}
export interface EditorRef {
  getDoc: () => string
  getEditor: () => EditorView
  getFileName: () => string
}

const dynamicPlugin: ImarkdownPlugin = {
  vim: false
}
const controller: Controller = {
  scrollBarTimer: null
}

const InternalEditor: ForwardRefRenderFunction<EditorRef, EditorProps> = (
  props,
  ref
): JSX.Element => {
  const { isVisible } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView>(null)
  const currentFile = useRef<string>('')
  const { colorMode } = useColorMode()

  window.imarkdown.themeModel = colorMode

  const handleEditorScroll = useCallback((e: UIEvent) => {
    if (controller.scrollBarTimer) {
      clearTimeout(controller.scrollBarTimer)
    }
    const target = e.target as HTMLDivElement
    if (target && target.classList.contains('is-scroll') === false) {
      target.classList.add('is-scroll')
    }
    controller.scrollBarTimer = setTimeout(() => {
      if (target) {
        target.classList.remove('is-scroll')
      }
    }, 1000)
  }, [])

  // intialize editor
  useEffect(() => {
    const editorToken = PubSub.subscribe(
      pubsubConfig.UPDATE_EDITOR_STATE,
      (_, data: EditorConfig) => {
        if (currentFile.current && editorRef.current) {
          // update scroll pos to main process
          const scrollTop = editorRef.current.scrollDOM.scrollTop
          const blockInfo = editorRef.current.elementAtHeight(scrollTop)
          window.ipcAPI.updateScrollPos({
            filepath: currentFile.current,
            fileData: {
              scrollPos: blockInfo.from
            }
          })
        }
        currentFile.current = data.file
        const view = new EditorView({
          state: generateState(data.doc),
          parent: containerRef.current
        })

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

        if (data.scrollPos) {
          view.dispatch({
            effects: EditorView.scrollIntoView(data.scrollPos, { y: 'start' })
          })
        }

        editorRef.current = view
      }
    )

    return () => {
      PubSub.unsubscribe(editorToken)
    }
  }, [colorMode])

  // scroll event listener
  useEffect(() => {
    const preivewToken = PubSub.subscribe(
      pubsubConfig.SYNC_SCROLL_FROM_PREVIEW,
      (_, scrollInfo: LiveScroll) => {
        if (editorRef.current && !editorRef.current.hasFocus) {
          const cm = editorRef.current
          const blockInfo = cm.lineBlockAt(
            cm.state.doc.line(scrollInfo.line).from
          )

          if (!cm.inView) {
            cm.dispatch({
              effects: EditorView.scrollIntoView(blockInfo.from, { y: 'start' })
            })
          } else {
            const scrollTop =
              blockInfo.top + blockInfo.height * scrollInfo.percent
            // cm.scrollDOM.scrollTop = scrollTop
            cm.scrollDOM.scrollTo({ top: scrollTop, behavior: 'smooth' })
          }
        }
      }
    )

    return () => {
      PubSub.unsubscribe(preivewToken)
    }
  }, [])

  // dynamic plugin
  useEffect(() => {
    const pluginToken = PubSub.subscribe(
      pubsubConfig.UPDATE_DYNAMIC_PLUGINS,
      (_, data: ImarkdownPlugin) => {
        for (const key in data) {
          if (key === imardownPlugins.VIM) {
            dynamicPlugin[key as keyof ImarkdownPlugin] =
              data[key as keyof ImarkdownPlugin]
          }
        }
      }
    )
    return () => {
      PubSub.unsubscribe(pluginToken)
    }
  }, [])

  // plugin event listener
  useEffect(() => {
    const headNavToken = PubSub.subscribe(
      pubsubConfig.EXECUTE_HEAD_NAV,
      (_, headAnchor: number) => {
        if (editorRef.current && headAnchor) {
          const line = editorRef.current.state.doc.line(headAnchor)
          editorRef.current.dispatch({
            selection: { anchor: line.from, head: line.from },
            effects: EditorView.scrollIntoView(line.from, { y: 'start' })
          })
        }
      }
    )

    return () => {
      PubSub.unsubscribe(headNavToken)
    }
  }, [])

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

  useImperativeHandle(
    ref,
    () => {
      return {
        getDoc() {
          return editorRef.current?.state.doc.toString()
        },
        getEditor() {
          return editorRef.current
        },
        getFileName() {
          return currentFile.current
        }
      }
    },
    []
  )

  return (
    <Box
      overflow="auto"
      width="100%"
      height="100%"
      id="editor_box"
      display={isVisible ? 'block' : 'none'}
    >
      <Box display="flex" flexDirection="column" height="100%" width="100%">
        <Box
          ref={containerRef}
          flexGrow={1}
          overflow="auto"
          pl={4}
          onScrollCapture={handleEditorScroll}
        ></Box>
      </Box>
    </Box>
  )
}

const Editor = forwardRef<EditorRef, EditorProps>(InternalEditor)

export default Editor
