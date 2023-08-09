import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { tags } from '@lezer/highlight'
import {
  HighlightStyle,
  syntaxHighlighting,
  defaultHighlightStyle
} from '@codemirror/language'

import { markTags } from '../markdown-tags-extension'

export const imarkdownTheme = EditorView.theme({
  '&': {
    // backgroundColor: 'transparent !important',
    height: '100%',
    fontSize: '1.0em',
    padding: '12px'
  },
  '&.cm-focused': {
    outline: 'none'
  },
  // '&.cm-focused .cm-cursor': {
  //   transition: 'all 80ms'
  // },
  '.cm-scroller': {
    fontFamily: 'inherit !important'
  },
  '&.cm-editor': {
    textAlign: 'left',
    padding: '0'
  },
  '.cm-gutters': {
    backgroundColor: '#ffffff',
    color: '#8f8f8f'
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
    marginRight: '5px'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#cccccc44'
  },
  '.cm-fat-cursor': {
    background: '#48BB78' + ' !important'
  },
  '&:not(.cm-focused) .cm-fat-cursor': {
    background: 'none !important',
    outline: 'solid 1px' + '#48BB78' + '  !important',
    color: 'transparent !important'
  },
  '.cm-activeLine': {
    backgroundColor: '#cccccc44',
    borderTopRightRadius: '2px',
    borderBottomRightRadius: '2px'
  }
})

// for markdown

const customColors = {
  content: {
    head: '#586EA5',
    quote: '#839496',
    emphasis: '#FD5455',
    list: '#000000',
    url: '#718096',
    link: '#68D391',
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

const imarkdownSyntaxHighlighting = HighlightStyle.define([
  {
    tag: tags.heading1,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1em',
    textDecoration: 'none !important'
  },
  {
    tag: tags.heading2,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1em',
    textDecoration: 'none !important'
  },
  {
    tag: tags.heading3,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1em',
    textDecoration: 'none !important'
  },
  {
    tag: tags.heading4,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1em',
    textDecoration: 'none !important'
  },
  {
    tag: tags.heading5,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1em',
    textDecoration: 'none !important'
  },
  {
    tag: tags.heading6,
    fontWeight: 'bold',
    color: customColors.content.head,
    fontSize: '1em',
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
    tag: tags.heading, // table head
    color: customColors.content.head,
    textDecoration: 'none !important'
  },
  // ------ for marker highlight
  {
    tag: markTags.headingMark,
    color: customColors.markers.headMark,
    textDecoration: 'none !important'
  },
  {
    tag: markTags.quoteMark,
    color: customColors.markers.quoteMark
  },
  {
    tag: markTags.listMark,
    color: customColors.markers.listMark
  },
  {
    tag: markTags.linkMark,
    color: customColors.markers.linkMark,
    textDecoration: 'none !important'
  },
  {
    tag: markTags.emphasisMark,
    color: customColors.markers.empahsisMark
  },
  {
    tag: markTags.codeMark,
    color: customColors.markers.codeMark
  },
  {
    tag: markTags.codeInfo,
    color: customColors.markers.codeInfo
  },
  {
    tag: markTags.linkTitle,
    colors: customColors.markers.linkTitle
  },
  {
    tag: markTags.linkLabel,
    color: customColors.markers.linkLabel
  },
  {
    tag: markTags.url,
    color: customColors.content.url
  },
  {
    tag: markTags.inlineCode,
    color: customColors.content.inlineCode
  },
  {
    tag: markTags.tableDelimiter,
    color: customColors.markers.tableDelimiter
  }
])

export const imarkdown: Extension = [
  imarkdownTheme,
  syntaxHighlighting(defaultHighlightStyle),
  syntaxHighlighting(imarkdownSyntaxHighlighting)
]
