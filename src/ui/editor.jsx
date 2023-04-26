import PubSub from 'pubsub-js'
import { Box, useDisclosure } from '@chakra-ui/react'
import { Vim } from '@replit/codemirror-vim'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { Init_extends } from './components/use-codemirror.jsx'
import EditorStatusline from './components/editor-statusline.jsx'
import { TeleRecentFile } from './components/telescope.jsx'
import { modifyContent } from './app/reducers/fileContentSlice'

import PubSubConfig from '../config/frontend'
import { formateContent } from '../utils/frontend'
const ipcChannels = require('../config/backend')
const { vimOption } = require('../config/vim-option')

// global contronl
const controlls = {
  oldCursor: 0,
  cursorTimer: null,
  scrollTimer: null,
  changeGate: false
}

function updateCacheToMainProcess(cache) {
  window.electronAPI.updateCache(
    JSON.stringify({
      fileContent: cache
    })
  )
}

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
  const cm = useRef(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const reduxDispatch = useDispatch()

  // can not initital in state, case the page not renderer
  useEffect(() => {
    if (!refContainer.current) {
      return
    }

    const startState = EditorState.create({
      doc: '# In development',
      extensions: [
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            if (!controlls.changeGate) {
              isChangeCallback(true)
              PubSub.publish(PubSubConfig.statusLineModify, true)
              controlls.changeGate = true
            }
            reduxDispatch(modifyContent(update.state.doc.toString()))
            updateCacheToMainProcess(update.state.doc.toString())
          }

          if (update.selectionSet) {
            // listen cursor move
            if (controlls.cursorTimer) {
              clearTimeout(controlls.cursorTimer)
            }

            controlls.cursorTimer = setTimeout(() => {
              let cursorPos = update.state.selection.main.head
              let currentLine = update.state.doc.lineAt(cursorPos).number
              let totalLine = update.state.doc.lines
              PubSub.publish(PubSubConfig.statusLineInfo, {
                current: currentLine,
                total: totalLine
              })

              PubSub.publish(PubSubConfig.syncUpdateDocScroll, currentLine)
            }, 100)
          }
        }),
        EditorView.domEventHandlers({
          scroll(_event, view) {
            if (!refContainer.current.matches(':hover')) {
              return
            }
            if (!controlls.scrollTimer) {
              controlls.scrollTimer = setTimeout(() => {
                const scrollPos = view.elementAtHeight(
                  view.scrollDOM.scrollTop
                ).from
                // get line number
                scrollLine.previewScrollTo =
                  view.state.doc.lineAt(scrollPos).number
                controlls.scrollTimer = null
              }, 500)
            }
          }
        }),
        ...Init_extends()
      ]
    })

    // add view keymap, just need once
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
      formateContent(view)
    })
    Vim.defineEx('telescopeRecentFile', 'telescopeR', () => {
      onOpen()
    })
    Vim.map('<Space>n', ':telescopeRecentFile<cr>')

    const view = new EditorView({
      state: startState,
      parent: refContainer.current
    })

    // setEditorView(view)
    // the initial must in top, to ensure below cm.current have value
    cm.current = view
    view.focus()

    return () => {
      // console.log('[return editor.jsx] run initial drop')
      view.destroy()
    }
  }, [refContainer])

  useEffect(() => {
    if (cm.current && isVisible) {
      const lineObj = cm.current.state.doc.line(scrollLine.editorScrollTo)
      cm.current.dispatch({
        selection: {
          anchor: lineObj.from,
          head: lineObj.from
        },
        effects: EditorView.scrollIntoView(lineObj.from, { y: 'start' }),
        scrollIntoView: true
      })
      return () => { }
    }
  }, [cm, isVisible])

  // activate create new state
  useEffect(() => {
    if (cm.current) {
      let token = PubSub.subscribe(
        PubSubConfig.reCreateStateChannel,
        (_msg, data) => {
          scrollLine.previewScrollTo = 1
          cm.current.scrollDOM.scrollTop = 0
          cm.current.setState(
            EditorState.create({
              doc: data ? data : '',
              extensions: [
                EditorView.updateListener.of(update => {
                  if (update.docChanged) {
                    if (!controlls.changeGate) {
                      isChangeCallback(true)
                      PubSub.publish(PubSubConfig.statusLineModify, true)
                      controlls.changeGate = true
                    }
                    reduxDispatch(modifyContent(update.state.doc.toString()))
                    updateCacheToMainProcess(update.state.doc.toString())
                  }
                  if (update.selectionSet) {
                    // listen cursor move
                    if (controlls.cursorTimer) {
                      clearTimeout(controlls.cursorTimer)
                    }

                    controlls.cursorTimer = setTimeout(() => {
                      let cursorPos = update.state.selection.main.head
                      let currentLine =
                        update.state.doc.lineAt(cursorPos).number
                      let totalLine = update.state.doc.lines
                      PubSub.publish(PubSubConfig.statusLineInfo, {
                        current: currentLine,
                        total: totalLine
                      })
                      PubSub.publish(
                        PubSubConfig.syncUpdateDocScroll,
                        currentLine
                      )
                    }, 100)
                  }
                }),
                EditorView.domEventHandlers({
                  scroll(_event, view) {
                    if (!refContainer.current.matches(':hover')) {
                      return
                    }
                    if (!controlls.scrollTimer) {
                      controlls.scrollTimer = setTimeout(() => {
                        const scrollPos = view.elementAtHeight(
                          view.scrollDOM.scrollTop
                        ).from
                        scrollLine.previewScrollTo =
                          view.state.doc.lineAt(scrollPos).number
                        controlls.scrollTimer = null
                      }, 500)
                    }
                  }
                }),
                ...Init_extends()
              ]
            })
          )

          controlls.changeGate = null
          PubSub.publish(PubSubConfig.statusLineClear, true)
        }
      )
      return () => {
        PubSub.unsubscribe(token)
      }
    }
  }, [cm])

  useEffect(() => {
    if (cm.current) {
      window.electronAPI.saveFile(handleSaveFile)

      return () => {
        window.electronAPI.removeSaveFile()
      }
    }
  }, [cm])

  function handleSaveFile(event, saveFilePath, saveFlag) {
    const formatedContent = formateContent(cm.current)

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
    PubSub.publish(PubSubConfig.statusLineModify, false)
    controlls.changeGate = null
  }

  function focuseCallback() {
    cm.current.focus()
  }

  return (
    <Box
      overflow="auto"
      width="100%"
      height="100%"
      id="editor_Box"
      fontSize="22px"
      display={isVisible ? 'block' : 'none'}
    >
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
