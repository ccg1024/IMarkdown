import PubSub from 'pubsub-js'
import { EditorState, Compartment } from '@codemirror/state'
import { languages } from '@codemirror/language-data'
import { tags, Tag, styleTags } from '@lezer/highlight'
import { MarkdownConfig } from '@lezer/markdown'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import {
  history,
  defaultKeymap,
  historyKeymap,
  indentWithTab
} from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import {
  keymap,
  dropCursor,
  EditorView,
  lineNumbers,
  drawSelection,
  crosshairCursor,
  highlightActiveLine,
  rectangularSelection,
  highlightSpecialChars,
  highlightActiveLineGutter
} from '@codemirror/view'
import {
  foldKeymap,
  indentOnInput,
  HighlightStyle,
  bracketMatching,
  syntaxHighlighting,
  defaultHighlightStyle
} from '@codemirror/language'
import {
  closeBrackets,
  completionKeymap,
  closeBracketsKeymap
} from '@codemirror/autocomplete'

import { AppDispatch, getCurrentFile } from '../app/store'
import pubsubConfig from '../../config/pubsub.config'
import { updateFileContent } from '../app/reducers/fileContentSlice'
import { updateFileIsChange } from '../app/reducers/recentFilesSlice'
import { LineOfStatusLine } from '../../types/renderer'

import { lightThemeColor } from './themes'
import paddingExtension from '../plugins/padding-extension'
import { codeBlockHighlight } from '../plugins/code-block-extension'
import { imgPreview } from '../plugins/img-extension'

const defaultTheme = EditorView.theme({
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
    backgroundColor: lightThemeColor.editor.gutterBackground,
    color: lightThemeColor.editor.gutterForeground
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
    backgroundColor: lightThemeColor.editor.activeGutterBackground
  },
  '.cm-fat-cursor': {
    background: lightThemeColor.editor.fatCursor + ' !important'
  },
  '&:not(.cm-focused) .cm-fat-cursor': {
    background: 'none !important',
    outline: 'solid 1px' + lightThemeColor.editor.fatCursor + '  !important',
    color: 'transparent !important'
  },
  // '.cm-scroller::-webkit-scrollbar': {
  //   // the total scroll bar
  //   width: '15px'
  // },
  // '.cm-scroller::-webkit-scrollbar-corner': {
  //   // the corner of scrollbar when have horizontal and vertical scrollbar at same time
  //   background: 'rgba(0, 0, 0, 0)'
  // },
  // '.cm-scroller::-webkit-scrollbar-thumb': {
  //   // the block which can be scroll on the scroll bar
  //   backgroundColor: '#ccc',
  //   borderRadius: '10px',
  //   border: '4px solid rgba(0, 0, 0, 0)',
  //   backgroundClip: 'content-box',
  //   minWidth: '15px',
  //   minHeight: '32px'
  // },
  // '.cm-scroller::-webkit-scrollbar-track': {
  //   // the track where the scroll-thumb scroll on
  //   backgroundColor: 'rgba(0, 0, 0, 0)'
  // },
  '.cm-activeLine': {
    backgroundColor: lightThemeColor.editor.activeLine,
    borderTopRightRadius: '2px',
    borderBottomRightRadius: '2px'
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
const markStylingExtension: MarkdownConfig = {
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
    color: customColors.content.inlineCode
    // backgroundColor: customColors.backgroundColor.inlineCode
  },
  {
    tag: customTags.tableDelimiter,
    color: customColors.markers.tableDelimiter
  }
])

export const vimPlugin = new Compartment()

const imarkdownDefaultExtensions = [
  vimPlugin.of([]),
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle),
  syntaxHighlighting(imarkdownSyntaxHighlighting),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    indentWithTab,
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap
  ]),
  defaultTheme,
  EditorView.lineWrapping,
  markdown({
    base: markdownLanguage,
    codeLanguages: languages,
    addKeymap: true,
    extensions: [markStylingExtension]
  }),
  codeBlockHighlight(),
  paddingExtension,
  imgPreview()
]

interface Controller {
  closeChange: boolean
  cursorTimer: number | null
  scrollTimer: number | null
}

const controller: Controller = {
  closeChange: false,
  cursorTimer: null,
  scrollTimer: null
}

function updateMainDocCache(doc: string) {
  window.ipcAPI.updateDocCache(doc)
}

const generateState = (doc: string, reduxDispath: AppDispatch): EditorState => {
  const state = EditorState.create({
    doc: doc,
    extensions: [
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          if (!controller.closeChange) {
            // PubSub.publish(pubsubConfig.UPDATE_STATUS_LINE, true)
            reduxDispath(
              updateFileIsChange({
                id: getCurrentFile(),
                isChange: true
              })
            )
            controller.closeChange = true
          }

          reduxDispath(updateFileContent(update.state.doc.toString()))
          updateMainDocCache(update.state.doc.toString())
        }

        // if (update.selectionSet) {
        //   if (controller.cursorTimer) {
        //     window.clearTimeout(controller.cursorTimer)
        //   }

        //   controller.cursorTimer = window.setTimeout(() => {
        //     const cursor = update.state.selection.main.head
        //     const line = update.state.doc.lineAt(cursor).number
        //     const totalLine = update.state.doc.lines
        //     const lineOfStatusLine: LineOfStatusLine = {
        //       current: line,
        //       total: totalLine
        //     }
        //     PubSub.publish(pubsubConfig.STATUS_LINE_INFO, lineOfStatusLine)
        //   }, 100)
        // }
      }),

      EditorView.domEventHandlers({
        scroll: (_event, view) => {
          if (!controller.scrollTimer && view.inView) {
            controller.scrollTimer = window.setTimeout(() => {
              const scrollTop = view.scrollDOM.scrollTop
              const topBlockInfo = view.elementAtHeight(scrollTop)
              const line = view.state.doc.lineAt(topBlockInfo.from).number

              if (topBlockInfo.length > 0) {
                const elementTop = topBlockInfo.top
                const elementHeight = topBlockInfo.height
                const percent = (scrollTop - elementTop) / elementHeight
                PubSub.publish(pubsubConfig.SYNC_SCROLL_TO_LIVE_PREVIEW, {
                  line: line,
                  percent: percent
                })
              } else {
                PubSub.publish(pubsubConfig.SYNC_SCROLL_TO_LIVE_PREVIEW, {
                  line: line
                })
              }
              controller.scrollTimer = null
            }, 500)
          }
        }
      }),

      ...imarkdownDefaultExtensions
    ]
  })

  PubSub.publish(pubsubConfig.SYNC_SCROLL_TO_LIVE_PREVIEW, { line: -1 })
  // PubSub.publish(pubsubConfig.STATUS_LINE_INFO, {
  //   current: 1,
  //   total: state.doc.lines
  // })

  return state
}

export function clearToken(statusLinePiple: string) {
  controller.closeChange = false
  if (statusLinePiple === pubsubConfig.CLEAR_STATUS_LINE) {
    PubSub.publish(pubsubConfig.CLEAR_STATUS_LINE)
  } else if (statusLinePiple === pubsubConfig.UPDATE_STATUS_LINE) {
    PubSub.publish(pubsubConfig.UPDATE_STATUS_LINE, false)
  }
}

export default generateState
