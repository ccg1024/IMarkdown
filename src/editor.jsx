import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Init_extends } from './components/use_codemirror.jsx'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { Box } from '@chakra-ui/react'
import './css/editor.css'
import { editorScrollPos } from './utils/after_load.jsx';
import { converWin32Path } from './App.js';

const fs = window.electronAPI.require('fs')
export let previewScroll = 1


const Editor = ({ initialDoc, onChange, filePath, handleIsChange }) => {
  const handleChange = useCallback(
    state => onChange(state.doc.toString()),
    [onChange]
  )

  // initial codemirror
  const refContainer = useRef(null)
  const [editorView, setEditorView] = useState()

  useEffect(() => {
    // use callback when display change
    if (editorView) {
      const targetNode = document.getElementById('editor_Box');
      const config = { attributes: true };

      const callback = (_mutationsList, _observer) => {
        if (targetNode.style.display === 'block') {
          // console.log('[INFO] Using listener to move ', editorScrollPos);
          const first = editorView.state.doc.line(editorScrollPos);
          editorView.dispatch({
            selection: {
              anchor: first.from,
              head: first.from
            },
            effects: EditorView.scrollIntoView(first.from, { y: 'start' }),
            scrollIntoView: true,
          });
        }
      }
      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);
    }
  }, [editorView]);

  useEffect(() => {
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
      editorView.scrollDOM.scrollTop = 0;
      console.log('got new file and reset codemirro with ' + filePath)
      editorView.setState(EditorState.create({
        doc: initialDoc,
        extensions: [
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
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
    }
  }, [editorView, filePath])

  useEffect(() => {
    if (editorView) {
      window.electronAPI.saveFile((_event, saveFilePath) => {
        console.log('current save path: ' + saveFilePath)
        fs.writeFileSync(saveFilePath, editorView.state.doc.toString())
        handleIsChange(false);

        // send info to main process;
        window.electronAPI.setContentChange(false);

        // update the icon color at FirDir component
        const targetDom = document.getElementById(converWin32Path(saveFilePath));
        const iconDom = targetDom.getElementsByTagName('svg')[0];
        iconDom.style.color = '#68D391';
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
