import React, { FC, ReactNode } from 'react'
import { Box, Text, useColorModeValue } from '@chakra-ui/react'

interface GhostTextProps {
  children: ReactNode
}

const GhostText: FC<GhostTextProps> = (props): JSX.Element => {
  return (
    <Text
      textAlign="center"
      mb={2}
      color={useColorModeValue('gray.400', 'gray.400')}
    >
      {props.children}
    </Text>
  )
}

const GhostInfo: FC = (): JSX.Element => {
  return (
    <Box
      position="absolute"
      zIndex={2}
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
    >
      <GhostText>IMarkdown -v 2.0.0</GhostText>
      <GhostText>
        This is a personal hobby project, using Electron and ReactJS to build a
        cross-platform markdown editor
      </GhostText>
      <GhostText>Author: {'<ccg1024@qq.com>'}</GhostText>
    </Box>
  )
}

export default GhostInfo
