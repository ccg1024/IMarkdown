import PubSub from 'pubsub-js'
import { EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view'

import pubsubConfig from '../../config/pubsub.config'

export function updatePadding(view: EditorView): void {
  const contentElement = view.contentDOM
  if (contentElement) {
    const paddingSize = view.scrollDOM.clientHeight - view.defaultLineHeight - 5
    contentElement.style.paddingBottom = `${paddingSize}px`
    PubSub.publish(pubsubConfig.UPDATE_PADDING_BOTTOM, `${paddingSize}px`)
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
