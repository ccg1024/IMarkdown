import PubSub from 'pubsub-js'
import { Box, useDisclosure } from '@chakra-ui/react'
import { Vim } from '@replit/codemirror-vim'
import { EditorView } from '@codemirror/view'
import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import EditorStatusline from './components/editor-statusline.jsx'
import { TeleRecentFile } from './components/telescope.jsx'
import GhostInfo from './components/ghostInfo.jsx'

import {
  generateEditor,
  clear as clearGenerateEditor
} from './libs/generate-editor.js'
import PubSubConfig from '../config/frontend'
import { formateContent } from '../utils/frontend'
const ipcChannels = require('../config/backend')
const { vimOption } = require('../config/vim-option')

const Editor = ({
  isChangeCallback,
  isVisible,
  scrollLine,
  openedPathCallback,
  recentFilesCallback,
  recentFiles,
  fileSaveCallback
}) => {
  // initial codemirror
  const refContainer = useRef(null)
  const cmRef = useRef(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const reduxDispatch = useDispatch()

  useEffect(() => {
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
        scrollLine.previewScrollTo = 1
        const view = new EditorView({
          state: generateEditor(
            data,
            scrollLine,
            isChangeCallback,
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
    if (cmRef.current && isVisible) {
      const lineObj = cmRef.current.state.doc.line(scrollLine.editorScrollTo)
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
  }, [cmRef, isVisible])

  useEffect(() => {
    if (cmRef.current) {
      window.electronAPI.saveFile(handleSaveFile)

      return () => {
        window.electronAPI.removeSaveFile()
      }
    }
  }, [cmRef.current])

  function handleSaveFile(event, saveFilePath, saveFlag) {
    const formatedContent = formateContent(cmRef.current)

    event.sender.send(
      ipcChannels.reciveContentChannel,
      formatedContent,
      saveFilePath
    )

    if (saveFlag === 0) {
      // save empty file
      openedPathCallback(saveFilePath)
      recentFilesCallback(saveFilePath)
    }

    fileSaveCallback()
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
      display={isVisible ? 'block' : 'none'}
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
        recentFiles={recentFiles}
      />
    </Box>
  )
}

export default Editor
