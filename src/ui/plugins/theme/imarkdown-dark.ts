import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { tags } from '@lezer/highlight'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'

import { markTags } from '../markdown-tags-extension'

const color = {
  black: '#000000',
  white: '#ffffff',
  whiteAlpha200: 'RGBA(255, 255, 255, 0.08)',
  blackAlpha400: 'RGBA(0, 0, 0, 0.24)',
  blackAlpha200: 'RGBA(0, 0, 0, 0.08)',
  gray200: '#E2E8F0',
  content: {
    head: '#FFD74B',
    quote: '#839496',
    emphasis: '#FF7240',
    list: '#ffffff',
    url: '#545F9E',
    link: '#606FC2',
    inlineCode: '#E2E8F0'
  },
  markers: {
    headMark: '#927F41',
    quoteMark: '#CBD5E0',
    listMark: '#FF7141',
    linkMark: '#545F9E',
    empahsisMark: '#B0553A',
    codeMark: '#A0AEC0',
    codeInfo: '#83B807',
    tableDelimiter: '#A0AEC0'
  },
  backgroundColor: {
    inlineCode: 'RGBA(0, 0, 0, 0.24)'
  }
}

export const imarkdownDarkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'transparent',
      height: '100%',
      fontSize: '1.0em',
      padding: '12px'
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: color.gray200
    },
    '&.cm-focused': {
      outline: 'none'
    },
    '.cm-scroller': {
      fontFamily: 'inherit !important'
    },
    '&.cm-editor': {
      textAlign: 'left',
      padding: '0'
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: color.white
    },
    '.cm-gutters .cm-gutterElement': {
      paddingLeft: '1em',
      paddingRight: '10px',
      borderTopLeftRadius: '2px',
      borderBottomLeftRadius: '2px'
    },
    '.cm-line': {
      paddingLeft: '2px',
      paddingRight: '2px'
    },
    '.cm-content': {
      marginRight: '5px',
      caretColor: color.gray200
    },
    '.cm-activeLineGutter': {
      backgroundColor: color.whiteAlpha200
    },
    '.cm-fat-cursor': {
      background: color.gray200 + ' !important',
      color: `${color.black} !important`
    },
    '&:not(.cm-focused) .cm-fat-cursor': {
      background: 'none !important',
      outline: `1px solid ${color.gray200} !important`,
      color: 'transparent !important'
    },
    '.cm-activeLine': {
      backgroundColor: color.whiteAlpha200,
      borderTopRightRadius: '2px',
      borderBottomRightRadius: '2px'
    }
  },
  { dark: true }
)

export const imarkdownDarkSyntaxHighlighting = HighlightStyle.define([
  {
    tag: tags.list, // for ul or ol list content.
    color: color.content.list
  },
  {
    tag: tags.link,
    color: color.content.link
  },
  {
    tag: tags.quote,
    color: color.content.quote
  },
  {
    tag: tags.emphasis, // italic style
    color: color.content.emphasis,
    fontStyle: 'italic'
  },
  {
    tag: tags.strong, // bold style
    fontWeight: 'bold',
    color: color.content.emphasis
  },
  {
    tag: tags.heading, // table head and title head 1 - 6
    color: color.content.head,
    fontSize: '1em',
    fontWeight: 'bold'
  },
  {
    tag: tags.strikethrough, // 删除线
    textDecoration: 'line-through'
  },
  // ------ for marker highlight
  {
    tag: markTags.headingMark,
    color: color.markers.headMark,
    textDecoration: 'none'
  },
  {
    tag: markTags.quoteMark,
    color: color.markers.quoteMark
  },
  {
    tag: markTags.listMark,
    color: color.markers.listMark
  },
  {
    tag: markTags.linkMark,
    color: color.markers.linkMark,
    textDecoration: 'none'
  },
  {
    tag: markTags.emphasisMark,
    color: color.markers.empahsisMark
  },
  {
    tag: markTags.codeMark,
    color: color.markers.codeMark,
    backgroundColor: color.blackAlpha400
  },
  {
    tag: markTags.codeInfo,
    color: color.markers.codeInfo
  },
  {
    tag: markTags.url,
    color: color.content.url
  },
  {
    tag: markTags.inlineCode,
    color: color.content.inlineCode,
    backgroundColor: color.backgroundColor.inlineCode
  },
  {
    tag: markTags.tableDelimiter,
    color: color.markers.tableDelimiter
  },
  {
    tag: tags.meta, // could be delete mark ~~some~~.
    color: color.markers.quoteMark
  },
  // for code block highlight
  {
    tag: [
      tags.keyword,
      tags.typeName,
      tags.namespace,
      tags.bracket,
      tags.operator
    ],
    color: '#83B807'
  },
  {
    tag: [tags.string, tags.deleted],
    color: '#2aa198'
  },
  {
    tag: tags.variableName,
    color: '#ffffff'
  },
  {
    tag: [tags.regexp, /*@__PURE__*/ tags.special(tags.string)],
    color: '#cb4b16'
  },
  {
    tag: /*@__PURE__*/ tags.local(tags.variableName), // not work
    color: 'yellow !important'
  },
  {
    tag: [/*@__PURE__*/ tags.special(tags.variableName), tags.macroName], // not work
    color: 'yellow'
  },
  {
    tag: tags.propertyName,
    color: '#fff'
  },
  {
    tag: tags.comment,
    color: '#6A737D'
  },
  {
    tag: tags.invalid, // not work
    color: '#f00'
  },
  {
    tag: [
      tags.self,
      tags.null,
      tags.escape,
      tags.number,
      tags.definition(tags.variableName)
    ],
    color: '#dc322f'
  },
  {
    tag: [
      tags.className,
      tags.attributeName,
      tags.function(tags.variableName),
      tags.function(tags.propertyName),
      tags.definition(tags.propertyName)
    ],
    color: '#268bd2'
  }
])

export const imarkdownDark: Extension = [
  imarkdownDarkTheme,
  syntaxHighlighting(imarkdownDarkSyntaxHighlighting)
]
