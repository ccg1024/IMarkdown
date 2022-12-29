import React, { useCallback, useEffect } from 'react'
import useCodeMirror, { transparentTheme, my_syntaxHighlighting } from './components/use_codemirror.jsx'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, highlightActiveLine, lineNumbers, highlightActiveLineGutter } from '@codemirror/view'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import { indentOnInput, bracketMatching, syntaxHighlighting } from '@codemirror/language'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { Box } from '@chakra-ui/react'
import './css/editor.css'

const fs = window.electronAPI.require('fs')


const Editor = ({ initialDoc, onChange, filePath }) => {
  const handleChange = useCallback(
    state => onChange(state.doc.toString()),
    [onChange]
  )
  const [refContainer, editorView] = useCodeMirror({
    initialDoc: initialDoc,
    onChange: handleChange
  })

  useEffect(() => {
    if (editorView) {
      // do nothing
    }
    if (filePath) {
      console.log('got new file and reset codemirro with ' + filePath)
      editorView.setState(EditorState.create({
        doc: initialDoc,
        extensions: [
          keymap.of([...defaultKeymap, ...historyKeymap]),
          // lineNumbers(),
          highlightActiveLineGutter(),
          history(),
          indentOnInput(),
          bracketMatching(),
          highlightActiveLine(),
          markdown({
            base: markdownLanguage,
            codeLanguages: languages,
            addKeymap: true
          }),
          oneDark,
          transparentTheme,
          syntaxHighlighting(my_syntaxHighlighting),
          EditorView.lineWrapping,
          EditorView.updateListener.of(update => {
            if (update.changes) {
              handleChange && handleChange(update.state)
            }
          })
        ]
      }))
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
