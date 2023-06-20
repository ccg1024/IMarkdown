// CodeMirror Head navigation extension
// author: crazycodegame
import { EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view'
import { Extension } from '@codemirror/state'
import { ensureSyntaxTree } from '@codemirror/language'
import PubSub from 'pubsub-js'
import pubsubConfig from '../../config/pubsub.config'

export function headNavExtension(): Extension {
  return [headNavPlugin]
}

export interface HeadNave {
  headText: string
  headLevel: string
  headPos: number
}

const headNavPlugin = ViewPlugin.fromClass(
  class {
    headNav: HeadNave[] = []
    debounceTimer: NodeJS.Timeout
    leastPos: number = -1
    tagList: string[] = [
      'ATXHeading1',
      'ATXHeading2',
      'ATXHeading3',
      'ATXHeading4',
      'ATXHeading5',
      'ATXHeading6'
    ]
    constructor(view: EditorView) {
      this._startUpdate(view, 0, view.state.doc.length)
    }
    update(update: ViewUpdate) {
      if (update.docChanged) {
        update.changes.iterChangedRanges((fromA, _toA, _fromB, _toB) => {
          if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
          }

          if (this.leastPos === -1 || this.leastPos > fromA) {
            this.leastPos = fromA
          }
          this.debounceTimer = setTimeout(() => {
            this._startUpdate(
              update.view,
              this.leastPos,
              update.view.state.doc.length
            )
            this.leastPos = -1
          }, 500)
        })
      }
    }
    destroy() {
      this.headNav = null
    }
    _startUpdate(view: EditorView, from: number, to: number) {
      const startLine = view.state.doc.lineAt(from)
      let unchangedHead = this.headNav.filter(head => {
        if (head.headPos < startLine.number) return true
      })
      ensureSyntaxTree(view.state, to, 200).iterate({
        from,
        to,
        enter: node => {
          if (this.tagList.includes(node.name)) {
            let line = view.state.doc.lineAt(node.from)
            unchangedHead.push({
              headPos: line.number,
              headText: line.text,
              headLevel: node.name[node.name.length - 1]
            })
          }
        }
      })
      this.headNav = unchangedHead
      PubSub.publish(pubsubConfig.UPDATE_HEAD_NAV, this.headNav)
    }
  }
)
