import { useEffect, useState, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import {
  EditorView,
  keymap,
  highlightActiveLine,
  lineNumbers,
  highlightActiveLineGutter,
  drawSelection,
  highlightSpecialChars,
  dropCursor,
  rectangularSelection,
  crosshairCursor
} from '@codemirror/view'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import {
  indentOnInput,
  bracketMatching,
  HighlightStyle,
  syntaxHighlighting,
  foldGutter,
  foldKeymap,
  defaultHighlightStyle
} from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { vim } from "@replit/codemirror-vim"
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap
} from '@codemirror/autocomplete'


export const transparentTheme = EditorView.theme({
  '&': {
    // backgroundColor: 'transparent !important',
    height: '100%',
    fontSize: '1.2em',
    padding: '12px',
  }
})

export const my_syntaxHighlighting = HighlightStyle.define([
  {
    tag: tags.heading1,
    fontWeight: 'bold',
    color: '#E90064'
  },
  {
    tag: tags.heading2,
    fontWeight: 'bold',
    color: '#E90064'
  },
  {
    tag: tags.heading3,
    fontWeight: 'bold',
    color: '#E90064'
  },
  {
    tag: tags.heading4,
    fontWeight: 'bold',
    color: '#E90064'
  },
  {
    tag: tags.heading5,
    fontWeight: 'bold',
    color: '#E90064'
  },
  {
    tag: tags.heading6,
    fontWeight: 'bold',
    color: '#E90064'
  },
  {
    tag: tags.list,
    color: '#537FE7'
  },
  {
    tag: tags.link,
    color: '#913175'
  },
  {
    tag: tags.quote,
    color: '#7D5A50'
  },
  {
    tag: tags.emphasis,
    color: '#EA5455'
  },
])

export const Init_extends = () => {
  const temp = [
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...searchKeymap,
      ...closeBracketsKeymap,
      ...completionKeymap
    ]),
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
    // oneDark,
    transparentTheme,
    syntaxHighlighting(my_syntaxHighlighting, { fallback: true }),
    EditorView.lineWrapping,
    drawSelection(),
    dropCursor(),
    vim(),
    highlightSpecialChars(),
    rectangularSelection(),
    crosshairCursor(),
    foldGutter(),
    highlightSelectionMatches(),
    closeBrackets(),
    autocompletion()
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
