import PubSub from 'pubsub-js'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'

import { modifyContent } from '../../app/reducers/fileContentSlice'
import { Init_extends } from '../../components/use-codemirror'
import PubSubConfig from '../../../config/frontend'
import { IScrollPosInfo } from '../types/render'
import { Dispatch } from '@reduxjs/toolkit'

interface IController {
  closeChange: boolean
  cursorTimer: number | null
  scrollTimer: number | null
}

const controller: IController = {
  closeChange: false,
  cursorTimer: null,
  scrollTimer: null
}

function updateCacheToMainProcess(doc: string) {
  window.electronAPI.updateCache(JSON.stringify({ fileContent: doc }))
}

export function generateEditor(
  doc: string,
  scrollControler: IScrollPosInfo,
  reduxDispatch: Dispatch
): EditorState {
  scrollControler.previewScrollTo = 1
  const state = EditorState.create({
    doc: doc,
    extensions: [
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          if (!controller.closeChange) {
            PubSub.publish(PubSubConfig.statusLineModify, true)
            controller.closeChange = true
          }
          reduxDispatch(modifyContent(update.view.state.doc.toString()))
          updateCacheToMainProcess(update.view.state.doc.toString())
        }
        if (update.selectionSet) {
          if (controller.cursorTimer) {
            window.clearTimeout(controller.cursorTimer)
          }
          controller.cursorTimer = window.setTimeout(() => {
            const cursor = update.view.state.selection.main.head
            const line = update.view.state.doc.lineAt(cursor).number
            const totalLine = update.view.state.doc.lines
            PubSub.publish(PubSubConfig.statusLineInfo, {
              current: line,
              total: totalLine
            })
          }, 100)
        }
      }),
      EditorView.domEventHandlers({
        scroll: (_event, view: EditorView) => {
          if (!controller.scrollTimer) {
            controller.scrollTimer = window.setTimeout(() => {
              const scrollTop = view.scrollDOM.scrollTop
              const topBlockInfo = view.elementAtHeight(scrollTop)
              const line = view.state.doc.lineAt(topBlockInfo.from).number
              scrollControler.previewScrollTo = line

              if (topBlockInfo.length > 0) {
                const elementTop = topBlockInfo.top
                const elementHeight = topBlockInfo.height
                const percent = (scrollTop - elementTop) / elementHeight
                PubSub.publish(PubSubConfig.syncUpdateDocScroll, {
                  line: line,
                  percent: percent
                })
              } else {
                PubSub.publish(PubSubConfig.syncUpdateDocScroll, { line: line })
              }
              controller.scrollTimer = null
            }, 500)
          }
        }
      }),
      ...Init_extends()
    ]
  })

  PubSub.publish(PubSubConfig.syncUpdateDocScroll, { line: -1 })
  PubSub.publish(PubSubConfig.statusLineInfo, {
    current: 1,
    total: state.doc.lines
  })

  return state
}

export function clear(statusLineOpt: string) {
  controller.closeChange = false
  if (statusLineOpt === PubSubConfig.statusLineClear) {
    PubSub.publish(PubSubConfig.statusLineClear, true)
  } else if (statusLineOpt === PubSubConfig.statusLineModify) {
    PubSub.publish(PubSubConfig.statusLineModify, false)
  }
}
