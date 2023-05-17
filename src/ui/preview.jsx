import _ from 'lodash'
import PubSub from 'pubsub-js'
import React, { useEffect } from 'react'
import { Box } from '@chakra-ui/react'

import MarkComponent from './components/mark-component'
import PubSubConfig from '../config/frontend'

import '../static/css/preview-scroll.css'

const Preview = ({ isVisible, scrollLine }) => {
  // run once after render
  useEffect(() => {
    if (isVisible) {
      let tempIdx = scrollLine.previewScrollTo
      let target = document.querySelector(
        "[data-sourcepos^='" + tempIdx + ":']"
      )
      while (target === null && tempIdx > 1) {
        tempIdx -= 1
        target = document.querySelector("[data-sourcepos^='" + tempIdx + ":']")
      }
      if (target !== null) {
        target.scrollIntoView()
      }

      if (scrollLine.previewScrollTo === 1) {
        scrollLine.previewScrollTop = 1
      }

      // set scroll listener
      const previewBody = document.querySelector('#preview-scroll')
      previewBody.onscroll = _.throttle(event => {
        scrollLine.previewScrollTop = event.target.scrollTop
      }, 500)
      return () => {
        previewBody.onscroll = null
        PubSub.publish(PubSubConfig.scrollSyncChannel, 'editor')
      }
    }
  }, [isVisible])

  return (
    <Box
      id="preview-scroll"
      overflow="auto"
      height="100%"
      width="100%"
      pl={2}
      display={isVisible ? 'block' : 'none'}
    >
      {isVisible && <MarkComponent />}
    </Box>
  )
}

export default Preview
