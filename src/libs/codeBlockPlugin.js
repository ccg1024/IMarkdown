import { Decoration } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import '../css/use-codemirror.css'

class CodeBlockPlugin {
  decoration = Decoration.none
  // timer = null

  constructor(view) {
    this.buildDeco(view)
  }

  update(update) {
    if (update.view.inView && update.viewportChanged) {
      if (update.docChanged) {
        this.buildDeco(update.view)
        // if (!this.timer) {
        //   this.timer = setTimeout(() => {
        //     this.buildDeco(update.view)
        //     this.timer = null
        //   }, 16)
        // }
      } else {
        this.buildDeco(update.view)
      }
    }
  }

  destroy() {
    this.decoration = null
  }

  buildDeco(view) {
    let builder = new RangeSetBuilder()
    let lineBlocks = view.viewportLineBlocks

    const startReg = /^```.+$/
    const endReg = /^```$/

    let isMatch = false

    for (let i = 0; i < lineBlocks.length; i++) {
      const lineObj = view.state.doc.lineAt(lineBlocks[i].from)
      if (isMatch) {
        builder.add(
          lineBlocks[i].from,
          lineBlocks[i].from,
          Decoration.line({ class: 'code-block' })
        )
        if (endReg.test(lineObj.text)) {
          isMatch = false
        }
      } else if (startReg.test(lineObj.text)) {
        builder.add(
          lineBlocks[i].from,
          lineBlocks[i].from,
          Decoration.line({ class: 'code-block' })
        )
        isMatch = true
      }
    }
    this.decoration = builder.finish()
  }
}

export default CodeBlockPlugin
