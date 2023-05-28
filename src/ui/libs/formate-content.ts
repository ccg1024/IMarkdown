import { EditorView } from '@codemirror/view'
import prettier from 'prettier/standalone'
import markdownParser from 'prettier/parser-markdown'

const formateContent = (view: EditorView): string => {
  let cursor = view.state.selection.main.head
  const doc = view.state.doc.toString()
  const formatedContent = prettier.format(doc, {
    parser: 'markdown',
    plugins: [markdownParser]
  })

  if (cursor > formatedContent.length) {
    cursor = formatedContent.length
  }

  if (doc !== formatedContent) {
    view.dispatch({
      changes: {
        from: 0,
        to: doc.length,
        insert: formatedContent
      },
      effects: EditorView.scrollIntoView(cursor, { y: 'center' })
    })

    setTimeout(() => {
      view.dispatch({
        selection: { anchor: cursor }
      })
    })
  }

  return formatedContent
}

export default formateContent
