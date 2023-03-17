import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Init_extends } from './components/use_codemirror.jsx'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { Box } from '@chakra-ui/react'
import './css/editor.css'

const fs = window.electronAPI.require('fs')
export let previewScroll = 1


const Editor = ({ initialDoc, onChange, filePath }) => {
  const handleChange = useCallback(
    state => onChange(state.doc.toString()),
    [onChange]
  )

  // initial codemirror
  const refContainer = useRef(null)
  const [editorView, setEditorView] = useState()

  useEffect(() => {
    if (!refContainer.current) {
      return
    }

    const startState = EditorState.create({
      doc: initialDoc,
      extensions: [
        EditorView.updateListener.of(update => {
          if (update.changes) {
            handleChange && handleChange(update.state)
          }
        }),
        EditorView.domEventHandlers({
          scroll(_event, view) {
            const self = document.getElementById("editor_Box")
            if (!self.matches(":hover")) { return; }
            // got corrected position
            const scrollPos = view.elementAtHeight(view.scrollDOM.scrollTop).from
            // console.log(view.elementAtHeight(view.scrollDOM.scrollTop).from)
            // console.log(view.state.doc.lineAt(view.elementAtHeight(view.scrollDOM.scrollTop).from))
            // got doc line number
            const lineNumber = view.state.doc.lineAt(scrollPos).number
            previewScroll = lineNumber
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
  }, [refContainer])

  useEffect(() => {
    if (filePath) {
      // set preview scroll to top
      previewScroll = 1
      console.log('got new file and reset codemirro with ' + filePath)
      editorView.setState(EditorState.create({
        doc: initialDoc,
        extensions: [
          EditorView.updateListener.of(update => {
            if (update.changes) {
              handleChange && handleChange(update.state)
            }
          }),
          EditorView.domEventHandlers({
            scroll(_event, view) {
              const self = document.getElementById("editor_Box")
              if (!self.matches(":hover")) { return; }
              // got corrected position
              const scrollPos = view.elementAtHeight(view.scrollDOM.scrollTop).from
              // console.log(view.elementAtHeight(view.scrollDOM.scrollTop).from)
              // console.log(view.state.doc.lineAt(view.elementAtHeight(view.scrollDOM.scrollTop).from))
              // got doc line number
              const lineNumber = view.state.doc.lineAt(scrollPos).number
              previewScroll = lineNumber
            }
          }),
          ...Init_extends()
        ]
      }))

      editorView.dispatch({
        effects: EditorView.scrollIntoView(1),
      });
    }
  }, [editorView, filePath])

  useEffect(() => {
    if (editorView) {
      window.electronAPI.saveFile((_event, saveFilePath) => {
        console.log('current save path: ' + saveFilePath)
        fs.writeFileSync(saveFilePath, editorView.state.doc.toString())
      })
      console.log('run save effect')
    }
    console.log("run save outerlop")
  }, [editorView])

  return <Box
    className='editor-wrapper'
    ref={refContainer}
    height='100%'
    overflow='auto'
  ></Box>
}

export default Editor
