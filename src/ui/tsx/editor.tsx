import PubSub from 'pubsub-js'
import { Box } from '@chakra-ui/react'
import { Vim } from '@replit/codemirror-vim'
import { EditorView } from '@codemirror/view'
import React, { useEffect, useRef, useCallback } from 'react'
import { IpcRendererEvent } from 'electron/renderer'
import { useDispatch } from 'react-redux'

import EditorStatusline from '../components/editor-statusline'

import { getCurrentMarkHead } from '../app/store'

import {
  generateEditor,
  clear as clearGenerateEditor
} from './libs/generate-editor'
import PubSubConfig from '../../config/frontend'
import { formateContent } from '../../utils/frontend'
import { IScrollPosInfo, IScrollInfo } from './types/render'
import { concatHeadAndContent } from './libs/tools'
const ipcChannels = require('../../config/backend')
const { vimOption } = require('../../config/vim-option')

type EditorProps = {
  isVisible: boolean
  scrollLine: IScrollPosInfo
}

const Editor: React.FC<EditorProps> = props => {
  const refContainer = useRef<HTMLDivElement>(null)
  const cmRef = useRef<EditorView>(null)
  const reduxDispatch = useCallback(useDispatch(), [])

  useEffect(() => {
    Vim.unmap('<C-o>', 'insert')
    Vim.unmap('<Space>')
    Vim.map('<C-n>', ':nohl<cr>')
    Vim.defineEx('write', 'w', () => {
      window.electronAPI.vimOption(
        JSON.stringify({
          option: vimOption.writeFile
        })
      )
    })
    Vim.defineEx('open', 'o', () => {
      const optionJson = JSON.stringify({
        option: vimOption.openFile
      })
      window.electronAPI.vimOption(optionJson)
    })
    Vim.defineEx('format', 'f', () => {
      if (cmRef.current) {
        formateContent(cmRef.current)
      }
    })

    let editorToken = PubSub.subscribe(
      PubSubConfig.reCreateStateChannel,
      (_msg, data) => {
        props.scrollLine.previewScrollTo = 1
        const view = new EditorView({
          state: generateEditor(data, props.scrollLine, reduxDispatch),
          parent: refContainer.current
        })
        if (cmRef.current) {
          cmRef.current.destroy()
        }
        view.focus()
        cmRef.current = view
        clearGenerateEditor(PubSubConfig.statusLineClear)
      }
    )

    let scrollToken = PubSub.subscribe(
      PubSubConfig.scrollSyncChannel,
      (_msg: string, data: string) => {
        if (cmRef.current && data === 'editor') {
          const lineObj = cmRef.current.state.doc.line(
            props.scrollLine.editorScrollTo
          )
          cmRef.current.dispatch({
            selection: { anchor: lineObj.from, head: lineObj.from },
            effects: EditorView.scrollIntoView(lineObj.from, { y: 'start' }),
            scrollIntoView: true
          })
        }
      }
    )

    let liveToken = PubSub.subscribe(
      PubSubConfig.liveScrollChannel,
      (_msg: string, data: IScrollInfo) => {
        if (cmRef.current) {
          const lineObj = cmRef.current.state.doc.line(Number(data.line))
          cmRef.current.dispatch({
            effects: EditorView.scrollIntoView(lineObj.from, { y: 'start' })
          })
        }
      }
    )

    return () => {
      PubSub.unsubscribe(editorToken)
      PubSub.unsubscribe(scrollToken)
      PubSub.unsubscribe(liveToken)
      cmRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    window.electronAPI.saveFile(handleSaveFile)

    return () => {
      window.electronAPI.removeSaveFile()
    }
  }, [])

  function handleSaveFile(
    event: IpcRendererEvent,
    saveFilePath: string,
    saveFlag: number
  ) {
    // const formatedContent = formateContent(cmRef.current)
    const formatedContent = cmRef.current.state.doc.toString()

    const currentMarkHead = getCurrentMarkHead()
    const totalContent = concatHeadAndContent(currentMarkHead, formatedContent)

    event.sender.send(
      ipcChannels.reciveContentChannel,
      totalContent,
      formatedContent,
      saveFilePath
    )

    if (saveFlag === 0) {
      // save empty file
      // using redux to change current file
    }

    clearGenerateEditor(PubSubConfig.statusLineModify)
  }

  return (
    <Box
      overflow="auto"
      width="100%"
      height="100%"
      id="editor_Box"
      display={props.isVisible ? 'block' : 'none'}
    >
      <Box display="flex" flexDirection="column" height="100%" width="100%">
        <Box ref={refContainer} pl={4} flexGrow={1} overflow="auto"></Box>
        <EditorStatusline />
      </Box>
    </Box>
  )
}

export default Editor
