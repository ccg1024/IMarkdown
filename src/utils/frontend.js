import { EditorView } from '@codemirror/view'
import prettier from 'prettier/esm/standalone.mjs'
import markdownParser from 'prettier/esm/parser-markdown.mjs'

export const formateContent = cm => {
  let currentCursor = cm.state.selection.main.head
  const oldString = cm.state.doc.toString()
  const formatedContent = prettier.format(oldString, {
    parser: 'markdown',
    plugins: [markdownParser]
  })

  if (formatedContent.length < currentCursor) {
    currentCursor = formatedContent.length
  }

  if (oldString !== formatedContent) {
    cm.dispatch({
      changes: {
        from: 0,
        to: cm.state.doc.length,
        insert: formatedContent
      },
      selection: { anchor: currentCursor, head: currentCursor },
      effects: EditorView.scrollIntoView(currentCursor, { y: 'nearest' }),
      scrollIntoView: true
    })
  }

  return formatedContent
}
