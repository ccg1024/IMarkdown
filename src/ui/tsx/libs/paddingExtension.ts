import { EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view'
import PubSub from 'pubsub-js'
import PubSubConfig from '../../../config/frontend'

export function updatePadding(view: EditorView): void {
  const contentElement = view.contentDOM
  if (contentElement) {
    const paddingSize = view.scrollDOM.clientHeight - view.defaultLineHeight - 5
    contentElement.style.paddingBottom = `${paddingSize}px`
    PubSub.publish(PubSubConfig.updatePaddingChannel, `${paddingSize}px`)
  }
}

const paddingExtension = ViewPlugin.fromClass(
  class {
    update(update: ViewUpdate) {
      if (update.geometryChanged) {
        updatePadding(update.view)
      }
    }
  }
)

export default paddingExtension
