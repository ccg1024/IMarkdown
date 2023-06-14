import PubSub from 'pubsub-js'
import { EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view'

import pubsubConfig from '../../config/pubsub.config'

export function updatePadding(view: EditorView): void {
  const contentElement = view.contentDOM
  if (contentElement) {
    const paddingSize = Math.floor(
      view.scrollDOM.clientHeight - view.defaultLineHeight
    )
    const currentPadding = `${paddingSize}px`
    if (contentElement.style.paddingBottom !== currentPadding) {
      contentElement.style.paddingBottom = currentPadding
      PubSub.publish(pubsubConfig.UPDATE_PADDING_BOTTOM, currentPadding)
    }
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
