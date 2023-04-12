import prettier from 'prettier/esm/standalone.mjs'
import markdownParser from 'prettier/esm/parser-markdown.mjs'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Init_extends } from './components/use_codemirror.jsx'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { Box } from '@chakra-ui/react'
import './css/editor.css'
import { editorScrollPos } from './utils/after_load.jsx'
import { converWin32Path } from './App.js'

const fs = window.electronAPI.require('fs')
export let previewScroll = 1

const Editor = ({
  initialDoc,
  onChange,
  filePath,
  handleIsChange,
  handleSideFilePathChange
}) => {
  const handleChange = useCallback(
    state => onChange(state.doc.toString()),
    [onChange]
  )

  // initial codemirror
  const refContainer = useRef(null)
  const refTimer = useRef(null)
  const [editorView, setEditorView] = useState()

  // can not initital in state, case the page not renderer
  useEffect(() => {
    // console.log('[editor.jsx] run codemirror initial')
    if (!refContainer.current) {
      return
    }

    const startState = EditorState.create({
      doc: initialDoc,
      extensions: [
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            handleChange && handleChange(update.state)
          }
        }),
        EditorView.domEventHandlers({
          scroll(_event, view) {
            if (!refContainer.current.matches(':hover')) {
              return
            }
            if (!refTimer.current) {
              refTimer.current = setTimeout(() => {
                // got corrected position
                const scrollPos = view.elementAtHeight(
                  view.scrollDOM.scrollTop
                ).from
                // console.log(view.elementAtHeight(view.scrollDOM.scrollTop).from)
                // console.log(view.state.doc.lineAt(view.elementAtHeight(view.scrollDOM.scrollTop).from))
                // got doc line number
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
    // use callback when display change
    if (editorView) {
      // console.log('[editor.jsx] run scroll sync')
      const targetNode = document.getElementById('editor_Box')
      const config = { attributes: true }

      const callback = (_mutationsList, _observer) => {
        if (targetNode.style.display === 'block') {
          // console.log('[INFO] Using listener to move ', editorScrollPos);
          const first = editorView.state.doc.line(editorScrollPos)
          editorView.dispatch({
            selection: {
              anchor: first.from,
              head: first.from
            },
            effects: EditorView.scrollIntoView(first.from, { y: 'start' }),
            scrollIntoView: true
          })
        }
      }
      const observer = new MutationObserver(callback)
      observer.observe(targetNode, config)

      return () => {
        observer.disconnect()
        console.log('[return editor.jsx] run observer drop')
      }
    }
  }, [editorView])

  useEffect(() => {
    if (filePath) {
      // console.log('[editor.jsx] run reset codemirror')
      // set preview scroll to top
      previewScroll = 1
      editorView.scrollDOM.scrollTop = 0
      // console.log('got new file and reset codemirro with ' + filePath)
      editorView.setState(
        EditorState.create({
          doc: initialDoc,
          extensions: [
            EditorView.updateListener.of(update => {
              if (update.docChanged) {
                handleChange && handleChange(update.state)
              }
            }),
            EditorView.domEventHandlers({
              scroll(_event, view) {
                if (!refContainer.current.matches(':hover')) {
                  return
                }
                if (!refTimer.current) {
                  refTimer.current = setTimeout(() => {
                    // got corrected position
                    const scrollPos = view.elementAtHeight(
                      view.scrollDOM.scrollTop
                    ).from
                    // console.log(view.elementAtHeight(view.scrollDOM.scrollTop).from)
                    // console.log(view.state.doc.lineAt(view.elementAtHeight(view.scrollDOM.scrollTop).from))
                    // got doc line number
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

      return () => {
        // console.log('[return editor.jsx] run reset codemirror drop')
      }
    }
  }, [editorView, filePath])

  useEffect(() => {
    if (editorView) {
      window.electronAPI.saveFile(handleSaveFile)
      // console.log('[editor.jsx] listen save ipc')

      return () => {
        console.log('[return editor.jsx] run save drop')
        window.electronAPI.removeSaveFile()
      }
    }
  }, [editorView])

  function handleSaveFile(_event, saveFilePath, emptyFile) {
    // console.log('current save path: ' + saveFilePath)
    let currentCursor = editorView.state.selection.main.head

    const formatedFile = prettier.format(editorView.state.doc.toString(), {
      parser: 'markdown',
      plugins: [markdownParser]
    })
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: formatedFile
      }
    })
    if (formatedFile.length < currentCursor) {
      currentCursor = formatedFile.length
    }

    editorView.dispatch({
      selection: { anchor: currentCursor },
      scrollIntoView: true
    })

    fs.writeFileSync(saveFilePath, formatedFile)
    handleIsChange(false)

    // send info to main process;
    window.electronAPI.setContentChange(false)

    if (emptyFile === 1) {
      // save file from empty file path
      handleSideFilePathChange(saveFilePath)
    } else {
      // update the icon color at FirDir component
      const targetDom = document.getElementById(converWin32Path(saveFilePath))
      const iconDom = targetDom.getElementsByTagName('svg')[0]
      iconDom.style.color = '#48BB78'
    }
  }

  return (
    <Box
      className="editor-wrapper"
      ref={refContainer}
      height="100%"
      overflow="auto"
      pl={2}
    ></Box>
  )
}

export default Editor
