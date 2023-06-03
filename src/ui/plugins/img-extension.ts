import {
  EditorView,
  WidgetType,
  Decoration,
  DecorationSet,
  ViewUpdate,
  ViewPlugin
} from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { Extension } from '@codemirror/state'

const imgTheme = EditorView.baseTheme({
  '.img-preview': {
    marginTop: '1em',
    position: 'relative',
    zIndex: '-1',
    borderRadius: 'var(--chakra-radii-md)'
  }
})

class ImgWidget extends WidgetType {
  constructor(readonly src: string) {
    super()
  }

  eq(other: ImgWidget): boolean {
    return other.src == this.src
  }

  toDOM(_view: EditorView): HTMLElement {
    let wrap = document.createElement('img')
    wrap.setAttribute('src', `atom://${this.src}`)
    wrap.setAttribute('class', 'img-preview')
    return wrap
  }

  ignoreEvent(): boolean {
    return false
  }
}

function imgBlock(view: EditorView) {
  let widgets: any[] = []
  for (let { from, to } of view.visibleRanges) {
    try {
      syntaxTree(view.state).iterate({
        from,
        to,
        enter: node => {
          if (node.name == 'Image') {
            let imgText = view.state.doc.sliceString(node.from, node.to)
            let regRsult = /^!\[.*?\]\((.*?)\)$/.exec(imgText)
            if (regRsult.length > 1) {
              let src = regRsult[1]
              let deco = Decoration.widget({
                widget: new ImgWidget(src),
                side: 2
              })
              widgets.push(deco.range(node.to))
            }
          }
        }
      })
    } catch (error) {}
  }

  return Decoration.set(widgets)
}

const imgWidgetPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = imgBlock(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = imgBlock(update.view)
      }
    }
  },
  {
    decorations: v => v.decorations
  }
)

export function imgPreview(): Extension {
  return [imgTheme, imgWidgetPlugin]
}
