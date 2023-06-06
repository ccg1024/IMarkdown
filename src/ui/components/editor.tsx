import PubSub from 'pubsub-js'
import { Box } from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import { EditorView } from '@codemirror/view'
import { FC, useRef, useEffect, useCallback, UIEvent } from 'react'
import { IpcRendererEvent } from 'electron'

import StatusLine from './status-line'
import { getMarkHead } from '../app/store'
import { LiveScroll, EditorConfig } from '../../types/renderer'
import pubsubConfig from '../../config/pubsub.config'
import ipcConfig from '../../config/ipc.config'
import imardownPlugins, {
  ImarkdownPlugin
} from '../../config/plugin-list.config'
import generateState, { clearToken, vimPlugin } from '../libs/generate-state'
import formatContent from '../libs/formate-content'
import { concatHeaderAndContent } from '../libs/tools'
import { updateFileIsChange } from '../app/reducers/recentFilesSlice'

import { vim } from '@replit/codemirror-vim'

interface EditorProps {
  isVisible: boolean
}
interface Controller {
  scrollBarTimer: NodeJS.Timeout | null
}

const dynamicPlugin: ImarkdownPlugin = {
  vim: false
}
const controller: Controller = {
  scrollBarTimer: null
}

const Editor: FC<EditorProps> = ({ isVisible }): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView>(null)
  const currentFile = useRef<string>('')
  const reduxDispatch = useCallback(useDispatch(), [])

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
          window.ipcAPI.updateScrollPos(blockInfo.from, currentFile.current)
        }
        currentFile.current = data.file
        const view = new EditorView({
          state: generateState(data.doc, reduxDispatch),
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

        if (data.scrollPos) {
          view.dispatch({
            effects: EditorView.scrollIntoView(data.scrollPos, { y: 'start' })
          })
        }

        editorRef.current = view
        clearToken('')
      }
    )

    return () => {
      PubSub.unsubscribe(editorToken)
    }
  }, [])

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

  // ipc event listeners
  useEffect(() => {
    window.ipcAPI.listenFileSave((event: IpcRendererEvent, path: string) => {
      try {
        const doc = editorRef.current?.state.doc.toString()
        const markHead = getMarkHead()

        if (doc && markHead) {
          const content = concatHeaderAndContent(markHead, doc)
          event.sender.send(ipcConfig.SAVE_CONTENT, content, doc, path)
          reduxDispatch(
            updateFileIsChange({
              id: path,
              isChange: false
            })
          )
        }
        clearToken('')
      } catch (err) {}
    })
    window.ipcAPI.listenFormatFile(() => {
      // format content
      formatContent(editorRef.current)
    })

    return () => {
      window.ipcAPI.removeFileSaveListener()
      window.ipcAPI.removeFormatFileListener()
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

export default Editor
