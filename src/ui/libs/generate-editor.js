import PubSub from 'pubsub-js'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'

import { modifyContent } from '../app/reducers/fileContentSlice'
import { Init_extends } from '../components/use-codemirror'

import PubSubConfig from '../../config/frontend'

const controlls = {
  closeChangeGate: false,
  cursorTimer: null,
  scrollTimer: null,
  closeGhostGate: false
}

function updateCacheToMainProcess(doc) {
  window.electronAPI.updateCache(
    JSON.stringify({
      fileContent: doc
    })
  )
}

export function generateEditor(
  doc,
  scrollLine,
  isChangeCallback,
  reduxDispatch
) {
  scrollLine.previewScrollTo = 1
  const state = EditorState.create({
    doc: doc,
    extensions: [
      EditorView.updateListener.of(update => {
        // for doc change
        if (update.docChanged) {
          if (!controlls.closeGhostGate) {
            PubSub.publish(PubSubConfig.ghostInfoChannel, 'close')
            controlls.closeGhostGate = true
          }
          if (!controlls.closeChangeGate) {
            isChangeCallback(true)
            PubSub.publish(PubSubConfig.statusLineModify, true)
            controlls.closeChangeGate = true
          }
          reduxDispatch(modifyContent(update.view.state.doc.toString()))
          updateCacheToMainProcess(update.view.state.doc.toString())
        }

        // for cursor move
        if (update.selectionSet) {
          if (controlls.cursorTimer) {
            clearTimeout(controlls.cursorTimer)
          }

          controlls.cursorTimer = setTimeout(() => {
            let cursorPos = update.view.state.selection.main.head
            let currentLine = update.view.state.doc.lineAt(cursorPos).number
            let totalLine = update.view.state.doc.lines
            PubSub.publish(PubSubConfig.statusLineInfo, {
              current: currentLine,
              total: totalLine
            })

            PubSub.publish(PubSubConfig.syncUpdateDocScroll, currentLine)
          }, 100)
        }
      }),
      EditorView.domEventHandlers({
        scroll(_event, view) {
          if (!controlls.scrollTimer) {
            controlls.scrollTimer = setTimeout(() => {
              const scrollPos = view.elementAtHeight(
                view.scrollDOM.scrollTop
              ).from
              // get line number
              scrollLine.previewScrollTo =
                view.state.doc.lineAt(scrollPos).number
              controlls.scrollTimer = null
            }, 500)
          }
        }
      }),
      ...Init_extends()
    ]
  })

  if (doc && !controlls.closeGhostGate) {
    PubSub.publish(PubSubConfig.ghostInfoChannel, 'close')
    controlls.closeGhostGate = true
  }

  return state
}

export function clear(statusLineOpt) {
  controlls.closeChangeGate = false
  if (statusLineOpt) {
    if (statusLineOpt === PubSubConfig.statusLineClear) {
      PubSub.publish(PubSubConfig.statusLineClear, true)
    } else if (statusLineOpt === PubSubConfig.statusLineModify) {
      PubSub.publish(PubSubConfig.statusLineModify, false)
    }
  }
}
