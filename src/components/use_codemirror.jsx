import { useEffect, useState, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, highlightActiveLine, lineNumbers, highlightActiveLineGutter } from '@codemirror/view'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import { indentOnInput, bracketMatching, HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'


export const transparentTheme = EditorView.theme({
  '&': {
    // backgroundColor: 'transparent !important',
    height: '100%',
    fontSize: '1.2em',
    padding: '12px',
  }
})

export const my_syntaxHighlighting = HighlightStyle.define([
  // {
  //   tag: tags.heading1,
  //   fontSize: '1.6em',
  //   fontWeight: 'bold',
  // },
  // {
  //   tag: tags.heading2,
  //   fontSize: '1.5em',
  //   fontWeight: 'bold'
  // },
  // {
  //   tag: tags.content,  // just change the normal content size, the empty line not change
  //   fontSize: '1em'
  // }
])

export const Init_extends = () => {
  const temp = [
    keymap.of([...defaultKeymap, ...historyKeymap]),
    // lineNumbers(),
    highlightActiveLineGutter(),
    history(),
    indentOnInput(),
    bracketMatching(),
    // syntaxHighlighting(defaultHighlightStyle),
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
  ]
  return temp
}


const useCodeMirror = ({ initialDoc, onChange }) => {
  const refContainer = useRef(null)
  const [editorView, setEditorView] = useState()
  // const { onChange } = props.onChange

  useEffect(() => {
    if (!refContainer.current) {
      return
    }

    const startState = EditorState.create({
      doc: initialDoc,
      extensions: [
        EditorView.updateListener.of(update => {
          if (update.changes) {
            onChange && onChange(update.state)
          }
        }),
        ...Init_extends()
      ]
    })

    const view = new EditorView({
      state: startState,
      parent: refContainer.current,
      // extensions: [defaultHighlightStyle.fallback]
    })

    setEditorView(view)
  }, [refContainer])

  return [refContainer, editorView]
}


export default useCodeMirror
