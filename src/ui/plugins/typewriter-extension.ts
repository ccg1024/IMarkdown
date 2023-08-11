// CodeMirror Typewriter Mode Extension
// author: crazycodegame
import { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

export function typewriterMode(): Extension {
  return [
    EditorView.updateListener.of(update => {
      if (update.docChanged || update.selectionSet) {
        const cursor = update.view.state.selection.main.head
        update.view.dispatch({
          effects: EditorView.scrollIntoView(cursor, { y: 'center' })
        })
      }
    })
  ]
}
