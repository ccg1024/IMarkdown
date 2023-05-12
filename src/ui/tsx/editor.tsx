import PubSub from 'pubsub-js'
import { Box, useDisclosure } from '@chakra-ui/react'
import { Vim } from '@replit/codemirror-vim'
import { EditorView } from '@codemirror/view'
import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import EditorStatusline from '../components/editor-statusline'
import { TeleRecentFile } from '../components/telescope'
import GhostInfo from '../components/ghostInfo'

import {
  generateEditor,
  clear as clearGenerateEditor
} from '../libs/generate-editor'
import PubSubConfig from '../../config/frontend'
import { formateContent } from '../../utils/frontend'
import { IScrollPosInfo, IRecentFiles } from './types/render'
import { IpcRendererEvent } from 'electron/renderer'
const ipcChannels = require('../../config/backend')
const { vimOption } = require('../../config/vim-option')

type EditorProps = {
  isChangeCallback: Function
  isVisible: boolean
  scrollLine: IScrollPosInfo
  openedPathCallback: Function
  recentFilesCallback: Function
  recentFiles: IRecentFiles
  fileSaveCallback: Function
}

const Editor: React.FC<EditorProps> = props => {
  const refContainer = useRef<HTMLDivElement>(null)
  const cmRef = useRef<EditorView>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const reduxDispatch = useDispatch()

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
    Vim.defineEx('telescopeRecentFile', 'telescopeR', () => {
      onOpen()
    })
    Vim.map('<Space>n', ':telescopeRecentFile<cr>')

    let editorToken = PubSub.subscribe(
      PubSubConfig.reCreateStateChannel,
      (_msg, data) => {
        props.scrollLine.previewScrollTo = 1
        const view = new EditorView({
          state: generateEditor(
            data,
            props.scrollLine,
            props.isChangeCallback,
            reduxDispatch
          ),
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

    return () => {
      PubSub.unsubscribe(editorToken)
    }
  }, [])

  useEffect(() => {
    if (cmRef.current && props.isVisible) {
      const lineObj = cmRef.current.state.doc.line(
        props.scrollLine.editorScrollTo
      )
      cmRef.current.dispatch({
        selection: {
          anchor: lineObj.from,
          head: lineObj.from
        },
        effects: EditorView.scrollIntoView(lineObj.from, { y: 'start' }),
        scrollIntoView: true
      })
      return () => {}
    }
  }, [cmRef, props.isVisible])

  useEffect(() => {
    if (cmRef.current) {
      window.electronAPI.saveFile(handleSaveFile)

      return () => {
        window.electronAPI.removeSaveFile()
      }
    }
  }, [cmRef.current])

  function handleSaveFile(
    event: IpcRendererEvent,
    saveFilePath: string,
    saveFlag: number
  ) {
    const formatedContent = formateContent(cmRef.current)

    event.sender.send(
      ipcChannels.reciveContentChannel,
      formatedContent,
      saveFilePath
    )

    if (saveFlag === 0) {
      // save empty file
      props.openedPathCallback(saveFilePath)
      props.recentFilesCallback(saveFilePath)
    }

    props.fileSaveCallback()
    clearGenerateEditor(PubSubConfig.statusLineModify)
  }

  function focuseCallback() {
    cmRef.current.focus()
  }
  return (
    <Box
      overflow="auto"
      width="100%"
      height="100%"
      id="editor_Box"
      fontSize="22px"
      display={props.isVisible ? 'block' : 'none'}
      position="relative"
    >
      <GhostInfo />
      <Box display="flex" flexDirection="column" height="100%" width="100%">
        <Box ref={refContainer} pl={2} flexGrow={1} overflow="auto"></Box>
        <EditorStatusline />
      </Box>
      <TeleRecentFile
        isOpen={isOpen}
        onClose={onClose}
        focuseCallback={focuseCallback}
        recentFiles={props.recentFiles}
      />
    </Box>
  )
}

export default Editor
