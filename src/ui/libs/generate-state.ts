import PubSub from 'pubsub-js'
import { EditorState, Compartment } from '@codemirror/state'
import { languages } from '@codemirror/language-data'
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
  highlightActiveLine,
  rectangularSelection,
  highlightSpecialChars,
  highlightActiveLineGutter
} from '@codemirror/view'
import {
  foldKeymap,
  indentOnInput,
  bracketMatching
} from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'

import pubsubConfig from '../../config/pubsub.config'

import paddingExtension from '../plugins/padding-extension'
import { codeBlockHighlight } from '../plugins/code-block-extension'
import { imgPreview } from '../plugins/img-extension'
import { headNavExtension } from '../plugins/head-nav-extension'
import { markStylingExtension } from '../plugins/markdown-tags-extension'

export const vimPlugin = new Compartment()
export const themePlugin = new Compartment()

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
  themePlugin.of([]),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
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
  EditorView.lineWrapping,
  markdown({
    base: markdownLanguage,
    codeLanguages: languages,
    addKeymap: true,
    extensions: [markStylingExtension]
  }),
  codeBlockHighlight(),
  paddingExtension,
  imgPreview(),
  headNavExtension()
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

const generateState = (doc: string): EditorState => {
  const state = EditorState.create({
    doc: doc,
    extensions: [
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          PubSub.publish(pubsubConfig.UPDATE_EDITOR_CONTENT)
        }
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
              PubSub.publish(pubsubConfig.ACTIVE_HEAD_NAV, line)
              controller.scrollTimer = null
            }, 500)
          }
        }
      }),

      ...imarkdownDefaultExtensions
    ]
  })

  PubSub.publish(pubsubConfig.SYNC_SCROLL_TO_LIVE_PREVIEW, { line: -1 })
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
