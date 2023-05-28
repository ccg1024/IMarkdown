import PubSub from 'pubsub-js'
import { Box } from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import { EditorView } from '@codemirror/view'
import { FC, useRef, useEffect, useCallback } from 'react'
import { IpcRendererEvent } from 'electron'

import StatusLine from './status-line'
import { getMarkHead } from '../app/store'
import { LiveScroll } from '../../types/renderer'
import pubsubConfig from '../../config/pubsub.config'
import ipcConfig from '../../config/ipc.config'
import generateState, { clearToken } from '../libs/generate-state'
import formatContent from '../libs/formate-content'
import { concatHeaderAndContent } from '../libs/tools'

interface EditorProps {
  isVisible: boolean
}

const Editor: FC<EditorProps> = ({ isVisible }): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView>(null)
  const reduxDispatch = useCallback(useDispatch(), [])

  // intialize editor
  useEffect(() => {
    const editorToken = PubSub.subscribe(
      pubsubConfig.UPDATE_EDITOR_STATE,
      (_, data: string) => {
        const view = new EditorView({
          state: generateState(data, reduxDispatch),
          parent: containerRef.current
        })

        if (editorRef.current) {
          editorRef.current.destroy()
        }

        editorRef.current = view
        clearToken(pubsubConfig.CLEAR_STATUS_LINE)
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
        }
        clearToken(pubsubConfig.UPDATE_STATUS_LINE)
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

  return (
    <Box
      overflow="auto"
      width="100%"
      height="100%"
      id="editor_box"
      display={isVisible ? 'block' : 'none'}
    >
      <Box display="flex" flexDirection="column" height="100%" width="100%">
        <Box ref={containerRef} flexGrow={1} overflow="auto" pl={4}></Box>
        <StatusLine />
      </Box>
    </Box>
  )
}

export default Editor
