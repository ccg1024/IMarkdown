import PubSub from 'pubsub-js'
import { Box } from '@chakra-ui/react'
import { Vim } from '@replit/codemirror-vim'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import React, { useEffect, useRef, useState } from 'react'

import { Init_extends } from './components/use-codemirror.jsx'
import EditorStatusline from './components/editor-statusline.jsx'

import PubSubConfig from '../config/frontend'
import { formateContent } from '../utils/frontend'
const ipcChannels = require('../config/backend')
const { vimOption } = require('../config/vim-option')

export let previewScroll = 1

const Editor = ({
  initialDoc,
  onChange,
  isChangeCallback,
  isVisible,
  scrollLine,
  openedPathCallback,
  recentFilesCallback
}) => {
  // initial codemirror
  const refContainer = useRef(null)
  const refTimer = useRef(null)
  const updateTimer = useRef(null)
  const changeGate = useRef(null)
  const cursorTimer = useRef(null)
  const [editorView, setEditorView] = useState()

  const [createState, setCreateState] = useState(0)

  // can not initital in state, case the page not renderer
  useEffect(() => {
    if (!refContainer.current) {
      return
    }

    const startState = EditorState.create({
      doc: initialDoc,
      extensions: [
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            if (!changeGate.current) {
              isChangeCallback(true)
              PubSub.publish(PubSubConfig.statusLineModify, true)
              changeGate.current = true
            }
            if (!updateTimer.current) {
              onChange(update.state.doc.toString())
              updateTimer.current = setTimeout(() => {
                onChange(update.state.doc.toString())
                updateTimer.current = null
              }, 1500)
            }
          }

          if (update.selectionSet) {
            // listen cursor move
            if (cursorTimer.current) clearTimeout(cursorTimer.current)

            cursorTimer.current = setTimeout(() => {
              let cursorPos = update.state.selection.main.head
              let currentLine = update.state.doc.lineAt(cursorPos).number
              let totalLine = update.state.doc.lines
              PubSub.publish(PubSubConfig.statusLineInfo, {
                current: currentLine,
                total: totalLine
              })
            }, 500)
          }
        }),
        EditorView.domEventHandlers({
          scroll(_event, view) {
            if (!refContainer.current.matches(':hover')) {
              return
            }
            if (!refTimer.current) {
              refTimer.current = setTimeout(() => {
                const scrollPos = view.elementAtHeight(
                  view.scrollDOM.scrollTop
                ).from
                const lineNumber = view.state.doc.lineAt(scrollPos).number
                previewScroll = lineNumber
                refTimer.current = null
              }, 500)
            }
          }
        }),
        ...Init_extends()
      ]
    })

    // add view keymap, just need once
    Vim.map('<C-n>', ':nohl<cr>')
    Vim.defineEx('write', 'w', () => {
      window.electronAPI.vimOption(vimOption.writeFile)
    })
    Vim.defineEx('open', 'o', () => {
      window.electronAPI.vimOption(vimOption.openFile)
    })
    Vim.defineEx('format', 'f', () => {
      formateContent(view)
    })

    const view = new EditorView({
      state: startState,
      parent: refContainer.current
    })

    setEditorView(view)

    return () => {
      // console.log('[return editor.jsx] run initial drop')
      view.destroy()
    }
  }, [refContainer])

  useEffect(() => {
    if (editorView && isVisible && scrollLine) {
      const lineObj = editorView.state.doc.line(scrollLine)
      editorView.dispatch({
        selection: {
          anchor: lineObj.from,
          head: lineObj.from
        },
        effects: EditorView.scrollIntoView(lineObj.from, { y: 'start' }),
        scrollIntoView: true
      })
      return () => {}
    }
  }, [editorView, isVisible, scrollLine])

  // activate create new state
  useEffect(() => {
    let token = PubSub.subscribe(
      PubSubConfig.reCreateStateChannel,
      (_msg, _data) => {
        setCreateState(v => (v === 1 ? 2 : 1))
      }
    )
    return () => {
      PubSub.unsubscribe(token)
    }
  }, [])

  useEffect(() => {
    if (createState) {
      previewScroll = 1
      editorView.scrollDOM.scrollTop = 0
      editorView.setState(
        EditorState.create({
          doc: initialDoc,
          extensions: [
            EditorView.updateListener.of(update => {
              if (update.docChanged) {
                if (!changeGate.current) {
                  isChangeCallback(true)
                  PubSub.publish(PubSubConfig.statusLineModify, true)
                  changeGate.current = true
                }
                if (!updateTimer.current) {
                  onChange(update.state.doc.toString())
                  updateTimer.current = setTimeout(() => {
                    onChange(update.state.doc.toString())
                    updateTimer.current = null
                  }, 1500)
                }
              }
              if (update.selectionSet) {
                // listen cursor move
                if (cursorTimer.current) clearTimeout(cursorTimer.current)

                cursorTimer.current = setTimeout(() => {
                  let cursorPos = update.state.selection.main.head
                  let currentLine = update.state.doc.lineAt(cursorPos).number
                  let totalLine = update.state.doc.lines
                  PubSub.publish(PubSubConfig.statusLineInfo, {
                    current: currentLine,
                    total: totalLine
                  })
                }, 500)
              }
            }),
            EditorView.domEventHandlers({
              scroll(_event, view) {
                if (!refContainer.current.matches(':hover')) {
                  return
                }
                if (!refTimer.current) {
                  refTimer.current = setTimeout(() => {
                    const scrollPos = view.elementAtHeight(
                      view.scrollDOM.scrollTop
                    ).from
                    const lineNumber = view.state.doc.lineAt(scrollPos).number
                    previewScroll = lineNumber
                    refTimer.current = null
                  }, 500)
                }
              }
            }),
            ...Init_extends()
          ]
        })
      )

      changeGate.current = null
      PubSub.publish(PubSubConfig.statusLineClear, true)
      return () => {
        // console.log('[return editor.jsx] run reset codemirror drop')
      }
    }
  }, [editorView, createState])

  useEffect(() => {
    if (editorView) {
      window.electronAPI.saveFile(handleSaveFile)

      return () => {
        window.electronAPI.removeSaveFile()
      }
    }
  }, [editorView])

  function handleSaveFile(event, saveFilePath, saveFlag) {
    const formatedContent = formateContent(editorView)

    // send info to main process;
    window.electronAPI.setContentChange(false)
    window.electronAPI.setFilePath(saveFilePath)
    event.sender.send(
      ipcChannels.reciveContentChannel,
      formatedContent,
      saveFilePath
    )

    PubSub.publish(PubSubConfig.fileSaved, true)
    PubSub.publish(PubSubConfig.statusLineModify, false)
    changeGate.current = null

    if (saveFlag === 0) {
      // save empty file
      openedPathCallback(saveFilePath)
      recentFilesCallback(saveFilePath)
    }
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
    </Box>
  )
}

export default Editor
