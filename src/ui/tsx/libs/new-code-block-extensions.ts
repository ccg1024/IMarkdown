// CodeMirror Markdown Code Block Highlight Extension
// the code is not optimized, just for demo
// any update will rebuild the whole decorations and code block items
// just deal with the flaw for `code-block-extension`
// author: crazycodegame
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate
} from '@codemirror/view'
import { RangeSetBuilder, Extension } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'

interface CodeBlockItem {
  from: number
  to: number
}

const baseTheme = EditorView.baseTheme({
  '&light .cm-code-block': { backgroundColor: '#cccccc22' },
  '&dark .cm-code-block': { backgroundColor: '#cccccc22' }
})

export function codeBlockHighlight(): Extension {
  return [baseTheme, codeBlockHighlightPlugin]
}

const codeBlockHighlightPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    codeBlockItems: CodeBlockItem[] = []

    constructor(view: EditorView) {
      this.codeBlockItems = getCodeBlockItems(view)
      this.decorations = getDecorations(view, this.codeBlockItems)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.codeBlockItems = getCodeBlockItems(update.view)
        this.decorations = getDecorations(update.view, this.codeBlockItems)
      }
    }

    destroy() {
      this.decorations = null
      this.codeBlockItems = null
    }
  },
  {
    decorations: v => v.decorations
  }
)

const codeBlockDeco = Decoration.line({
  attributes: { class: 'cm-code-block' }
})

function isCodeBlock(line: any, codeBlockItems: CodeBlockItem[]): boolean {
  return codeBlockItems.some(
    item => item.from <= line.from && item.to >= line.to
  )
}

function getDecorations(
  view: EditorView,
  codeBlockItems: CodeBlockItem[]
): DecorationSet {
  let builder = new RangeSetBuilder<Decoration>()

  for (let { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      let line = view.state.doc.lineAt(pos)
      if (isCodeBlock(line, codeBlockItems)) {
        builder.add(line.from, line.from, codeBlockDeco)
      }
      pos = line.to + 1
    }
  }

  return builder.finish()
}

function getCodeBlockItems(view: EditorView): CodeBlockItem[] {
  const tree = syntaxTree(view.state)
  const codeBlockItems: CodeBlockItem[] = []

  tree.iterate({
    enter: node => {
      if (node.type.name === 'FencedCode') {
        codeBlockItems.push({
          from: node.from,
          to: node.to
        })
      }
    }
  })

  return codeBlockItems
}
