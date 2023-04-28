import PubSub from 'pubsub-js'
import React, { useState, useEffect } from 'react'
import { Box, Text, useColorModeValue } from '@chakra-ui/react'

import PubSubConfig from '../../config/frontend'

const GhostText = ({ children }) => {
  return (
    <Text
      textAlign="center"
      color={useColorModeValue('gray.400', 'gray.400')}
      mb={2}
    >
      {children}
    </Text>
  )
}

const GhostInfo = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let showGhostToken = PubSub.subscribe(
      PubSubConfig.ghostInfoChannel,
      (_msg, data) => {
        if (data === 'close') {
          setIsVisible(false)
        }
      }
    )

    return () => {
      PubSub.unsubscribe(showGhostToken)
    }
  }, [])
  return (
    <>
      {isVisible && (
        <Box
          position="absolute"
          zIndex={2}
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <GhostText>IMarkdown -v 1.0.0</GhostText>
          <GhostText>
            This is a personal hobby project, using Electron and ReactJS to
            build a cross-platform markdown editor
          </GhostText>
          <GhostText>Author: {'<ccg1024@qq.com>'}</GhostText>
        </Box>
      )}
    </>
  )
}

export default GhostInfo
