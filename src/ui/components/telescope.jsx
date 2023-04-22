import React, { useRef, useEffect, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody
} from '@chakra-ui/react'

import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { Vim } from '@replit/codemirror-vim'
import { TelescopeExtends } from './use-codemirror'

const { vimOption } = require('../../config/vim-option')

export const TeleRecentFile = ({
  isOpen,
  onClose,
  focuseCallback,
  recentFiles
}) => {
  const cmRef = useRef(null)
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <WrapModalContent
        cmRef={cmRef}
        focuseCallback={focuseCallback}
        onClose={onClose}
        recentFiles={recentFiles}
      />
    </Modal>
  )
}

const WrapModalContent = ({ cmRef, focuseCallback, onClose, recentFiles }) => {
  useEffect(() => {
    let initialDoc = []
    for (let key in recentFiles) {
      initialDoc.push(key)
    }
    const startState = EditorState.create({
      doc: initialDoc.join('\n'),
      extensions: [
        EditorView.domEventHandlers({
          keydown(event, view) {
            if (event.key === 'Enter') {
              const selectedFile = view.state.doc.lineAt(
                view.state.selection.main.head
              ).text

              if (selectedFile !== '') {
                window.electronAPI.vimOption(
                  JSON.stringify({
                    option: vimOption.openRecentFile,
                    filepath: selectedFile
                  })
                )
              }

              onClose()
            }
          }
        }),
        ...TelescopeExtends()
      ]
    })
    const view = new EditorView({
      state: startState,
      parent: cmRef.current
    })

    Vim.defineEx('telescopeCloseRecentFile', 'telescopeCloseR', () => {
      onClose()
    })
    Vim.map('<Space>N', ':telescopeCloseRecentFile<cr>')

    view.focus()
    return () => {
      view.destroy()
      focuseCallback()
    }
  }, [])
  return (
    <ModalContent>
      <ModalHeader textAlign="center">recent file</ModalHeader>
      <ModalBody
        ref={cmRef}
        fontFamily="'JetBrainsMono Nerd Font Mono'"
      ></ModalBody>
    </ModalContent>
  )
}
