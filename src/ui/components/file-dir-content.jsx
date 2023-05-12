import React from 'react'
import { Box, Flex, List, Text, useColorModeValue } from '@chakra-ui/react'
import uiColor from '../libs/colors'

const DirContent = ({ children }) => {
  return (
    <Box
      id="menu-content"
      width="60%"
      height="100%"
      backdropBlur="8px"
      backdropFilter="auto"
      overflow="auto"
      backgroundColor={useColorModeValue(
        uiColor.leftSideBar.backgroundColorLight,
        uiColor.leftSideBar.backgroundColorDark
      )}
    >
      <Flex alignItems="center" justifyContent="center">
        <Text
          as="h1"
          padding={2}
          textAlign="center"
          userSelect={'none'}
          fontSize="1.2em"
          color={useColorModeValue('gray.400', 'gray.400')}
        >
          Recent Files
        </Text>
      </Flex>
      <List>{children}</List>
    </Box>
  )
}

export default DirContent
