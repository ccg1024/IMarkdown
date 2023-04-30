import React from 'react'
import { Box, Flex, List, Text, useColorModeValue } from '@chakra-ui/react'

const DirContent = ({ children }) => {
  return (
    <Box
      position="absolute"
      id="menu-content"
      w="200px"
      height="100%"
      backdropBlur="8px"
      backdropFilter="auto"
      p={2}
      overflow="auto"
      backgroundColor={useColorModeValue('#FCFCFC', 'blackAlpha.400')}
    >
      <Flex
        alignItems="center"
        justifyContent="center"
        borderBottom="2px"
        borderBottomColor="whiteAlpha.600"
      >
        <Text
          as="h1"
          textAlign="center"
          px={2}
          fontWeight="bold"
          userSelect={'none'}
        >
          recent files
        </Text>
      </Flex>
      <List>{children}</List>
    </Box>
  )
}

export default DirContent
