import { EditorView } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { tags } from '@lezer/highlight'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'

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
    codeInfo: '#000000',
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
    tag: tags.list, // for ul or ol list content.
    color: customColors.content.list
  },
  {
    tag: tags.link,
    color: customColors.content.link
  },
  {
    tag: tags.quote,
    color: customColors.content.quote
  },
  {
    tag: tags.emphasis, // italic style
    color: customColors.content.emphasis,
    fontStyle: 'italic'
  },
  {
    tag: tags.strong, // bold style
    fontWeight: 'bold',
    color: customColors.content.emphasis
  },
  {
    tag: tags.heading, // table head and title head 1 - 6
    color: customColors.content.head,
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
    color: customColors.markers.headMark,
    textDecoration: 'none'
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
    textDecoration: 'none'
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
  // {
  //   tag: markTags.linkTitle, // no characters found
  //   colors: customColors.markers.linkTitle
  // },
  // {
  //   tag: markTags.linkLabel, // no characters found
  //   color: customColors.markers.linkLabel
  // },
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
  },
  {
    tag: tags.meta, // could be delete mark ~~some~~.
    color: customColors.markers.quoteMark
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
    color: '#D73A4A'
  },
  {
    tag: [tags.string, tags.deleted],
    color: '#032A57'
  },
  {
    tag: tags.variableName,
    color: '#000000'
  },
  {
    tag: [tags.regexp, /*@__PURE__*/ tags.special(tags.string)],
    color: '#E36208'
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
    color: '#333'
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
    color: '#015CC5'
  },
  {
    tag: [
      tags.className,
      tags.attributeName,
      tags.function(tags.variableName),
      tags.function(tags.propertyName),
      tags.definition(tags.propertyName)
    ],
    color: '#6F42C1'
  }
])

export const imarkdown: Extension = [
  imarkdownTheme,
  syntaxHighlighting(imarkdownSyntaxHighlighting)
]
