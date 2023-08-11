// CodeMirror Markdown Code Block Highlight Extension
// the code is not optimized, just for demo
// any update will rebuild the whole decorations and code block items
// just deal with the flaw for `code-block-extension`
// @2023-06-02 optimization extension, just update the visibleRanges.
// author: crazycodegame
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate
} from '@codemirror/view'
import { RangeSetBuilder, Extension } from '@codemirror/state'
import { ensureSyntaxTree } from '@codemirror/language'

import { lightThemeColor, darkThemeColor } from '../libs/themes'

const baseTheme = EditorView.baseTheme({
  '&light .cm-code-block': {
    backgroundColor: lightThemeColor.editor.codeBlockHighlight
  },
  '&dark .cm-code-block': {
    backgroundColor: darkThemeColor.editor.codeBlockHighlight
  }
})

export function codeBlockHighlight(): Extension {
  return [baseTheme, codeBlockHighlightPlugin]
}

const codeBlockHighlightPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = newDeco(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = newDeco(update.view)
      }
    }

    destroy() {
      this.decorations = null
    }
  },
  {
    decorations: v => v.decorations
  }
)

function newDeco(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()

  for (const { from, to } of view.visibleRanges) {
    const tree = ensureSyntaxTree(view.state, to, 200)
    if (tree) {
      tree.iterate({
        from,
        to,
        enter: node => {
          if (node.name == 'FencedCode') {
            for (let pos = node.from; pos <= node.to;) {
              const line = view.state.doc.lineAt(pos)
              builder.add(line.from, line.from, codeBlockDeco)
              pos = line.to + 1
            }
          }
        }
      })
    }
  }
  return builder.finish()
}

const codeBlockDeco = Decoration.line({
  attributes: { class: 'cm-code-block' }
})
