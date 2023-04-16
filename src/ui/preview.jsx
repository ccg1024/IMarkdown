import _ from 'lodash'
import React, { useEffect } from 'react'
import { Box } from '@chakra-ui/react'

import { previewScroll } from './editor'
import MarkComponent from './components/mark-component'

export let previewScrollTop = 1

const Preview = ({ doc, openedPath, isVisible }) => {
  // run once after render
  useEffect(() => {
    if (isVisible) {
      let tempIdx = previewScroll
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

      if (previewScroll === 1) {
        previewScrollTop = 1
      }

      // set scroll listener
      const previewBody = document.querySelector('#preview-scroll')
      previewBody.onscroll = _.throttle(event => {
        previewScrollTop = event.target.scrollTop
      }, 500)
      return () => {
        previewBody.onscroll = null
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
      fontSize="22px"
      display={isVisible ? 'block' : 'none'}
    >
      {isVisible && <MarkComponent doc={doc} openedPath={openedPath} />}
    </Box>
  )
}

export default Preview
