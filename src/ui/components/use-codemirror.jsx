import { vim } from '@replit/codemirror-vim'
import { EditorState } from '@codemirror/state'
import { useEffect, useState, useRef } from 'react'
import { languages } from '@codemirror/language-data'
import { tags, Tag, styleTags } from '@lezer/highlight'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import {
  EditorView,
  keymap,
  highlightActiveLine,
  drawSelection,
  highlightSpecialChars,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  ViewPlugin
} from '@codemirror/view'
import {
  indentOnInput,
  bracketMatching,
  HighlightStyle,
  syntaxHighlighting,
  foldKeymap,
  defaultHighlightStyle
} from '@codemirror/language'
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap
} from '@codemirror/autocomplete'

import CodeBlockPlugin from '../libs/codeBlockPlugin'

export const transparentTheme = EditorView.theme({
  '&': {
    // backgroundColor: 'transparent !important',
    height: '100%',
    fontSize: '1.0em',
    padding: '12px'
  }
})

const customTags = {
  headingMark: Tag.define(),
  quoteMark: Tag.define(),
  listMark: Tag.define(),
  linkMark: Tag.define(),
  emphasisMark: Tag.define(),
  codeMark: Tag.define(),
  codeText: Tag.define(),
  codeInfo: Tag.define(),
  linkTitle: Tag.define(),
  linkLabel: Tag.define(),
  url: Tag.define(),
  inlineCode: Tag.define(),
  tableDelimiter: Tag.define(),
  tableRow: Tag.define()
}

const MarkStylingExtension = {
  props: [
    styleTags({
      HeaderMark: customTags.headingMark,
      QuoteMark: customTags.quoteMark,
      ListMark: customTags.listMark,
      LinkMark: customTags.linkMark,
      EmphasisMark: customTags.emphasisMark,
      CodeMark: customTags.codeMark,
      CodeText: customTags.codeText,
      CodeInfo: customTags.codeInfo,
      LinkTitle: customTags.linkTitle,
      LinkLabel: customTags.linkLabel,
      URL: customTags.url,
      InlineCode: customTags.inlineCode,
      TableDelimiter: customTags.tableDelimiter,
      TableRow: customTags.tableRow
    })
  ]
}

const customColors = {
  content: {
    head: '#586EA5',
    quote: '#839496',
    emphasis: '#FD5455',
    list: '#000000',
    url: '#718096',
    link: '#68D391',
    comment: '#03C988',
    inlineCode: '#4299E1'
  },
  markers: {
    headMark: '#A9B8CC',
    quoteMark: '#CBD5E0',
    listMark: '#A0AEC0',
    linkMark: '#A9B8CC',
    empahsisMark: '#FC8181',
    codeMark: '#A0AEC0',
    codeText: '#000000',
    codeInfo: '#4A5568',
    linkTitle: 'blue',
    linkLabel: 'blue',
    tableDelimiter: '#A0AEC0'
  },
  backgroundColor: {
    inlineCode: '#EBF8FF'
  }
}

export const my_syntaxHighlighting = HighlightStyle.define([
  {
    tag: tags.heading1,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1.2em',
    textDecoration: 'none !important'
  },
  {
    tag: tags.heading2,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1.2em',
    textDecoration: 'none !important'
  },
  {
    tag: tags.heading3,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1.2em',
    textDecoration: 'none !important'
  },
  {
    tag: tags.heading4,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1.2em',
    textDecoration: 'none !important'
  },
  {
    tag: tags.heading5,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1.2em',
    textDecoration: 'none !important'
  },
  {
    tag: tags.heading6,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1.2em',
    textDecoration: 'none !important'
  },
  {
    tag: tags.list,
    color: customColors.content.list
  },
  {
    tag: tags.link,
    color: customColors.content.link,
    textDecoration: 'underline'
  },
  {
    tag: tags.quote,
    color: customColors.content.quote
  },
  {
    tag: tags.emphasis,
    color: customColors.content.emphasis,
    fontStyle: 'italic'
  },
  {
    tag: tags.strong,
    fontWeight: 'bold',
    color: customColors.content.emphasis
  },
  {
    tag: tags.comment,
    color: customColors.content.comment
  },
  {
    tag: tags.heading, // table head
    color: customColors.content.head,
    textDecoration: 'none !important'
  },
  // ------ for marker highlight
  {
    tag: customTags.headingMark,
    color: customColors.markers.headMark,
    textDecoration: 'none !important'
  },
  {
    tag: customTags.quoteMark,
    color: customColors.markers.quoteMark
  },
  {
    tag: customTags.listMark,
    color: customColors.markers.listMark
  },
  {
    tag: customTags.linkMark,
    color: customColors.markers.linkMark,
    textDecoration: 'none !important'
  },
  {
    tag: customTags.emphasisMark,
    color: customColors.markers.empahsisMark
  },
  {
    tag: customTags.codeMark,
    color: customColors.markers.codeMark
  },
  {
    tag: customTags.codeInfo,
    color: customColors.markers.codeInfo
  },
  {
    tag: customTags.linkTitle,
    colors: customColors.markers.linkTitle
  },
  {
    tag: customTags.linkLabel,
    color: customColors.markers.linkLabel
  },
  {
    tag: customTags.url,
    color: customColors.content.url
  },
  {
    tag: customTags.inlineCode,
    color: customColors.content.inlineCode,
    backgroundColor: customColors.backgroundColor.inlineCode
  },
  {
    tag: customTags.tableDelimiter,
    color: customColors.markers.tableDelimiter
  }
])

export const Init_extends = () => {
  const temp = [
    vim(),
    // lineNumbers(),
    // highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    // foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle),
    syntaxHighlighting(my_syntaxHighlighting),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...searchKeymap,
      ...closeBracketsKeymap,
      ...completionKeymap
    ]),
    // oneDark,
    transparentTheme,
    EditorView.lineWrapping,
    ViewPlugin.define(view => new CodeBlockPlugin(view), {
      decorations: v => v.decoration
    }),

    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
      addKeymap: true,
      extensions: [MarkStylingExtension]
    })
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
      parent: refContainer.current
    })

    setEditorView(view)
  }, [refContainer])

  return [refContainer, editorView]
}

export default useCodeMirror