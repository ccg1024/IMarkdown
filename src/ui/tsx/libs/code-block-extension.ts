import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate
} from '@codemirror/view'
import { RangeSetBuilder, Extension } from '@codemirror/state'
import '../../../static/css/use-codemirror.css'

export function codeBlockExtension(): Extension {
  return [useCodeBlockExtension]
}

const useCodeBlockExtension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = codeBlockDeco(view)
    }

    update(update: ViewUpdate) {
      if (update.view.inView && update.viewportChanged) {
        this.decorations = codeBlockDeco(update.view)
      }
    }
  },
  {
    decorations: v => v.decorations
  }
)

const codeBlock = Decoration.line({
  attributes: { class: 'code-block' }
})

function codeBlockDeco(view: EditorView) {
  let builder = new RangeSetBuilder<Decoration>()
  let lineBlockInfos = view.viewportLineBlocks
  let isMatch = false
  const startReg = /^```.+$/
  const endReg = /^```$/

  for (let i = 0; i < lineBlockInfos.length; i++) {
    let line = view.state.doc.lineAt(lineBlockInfos[i].from)
    if (isMatch) {
      builder.add(line.from, line.from, codeBlock)
      if (endReg.test(line.text)) {
        isMatch = false
      }
    } else if (startReg.test(line.text)) {
      builder.add(line.from, line.from, codeBlock)
      isMatch = true
    }
  }

  return builder.finish()
}
