import React from 'react'
import { Box, Flex, List, Text, useColorModeValue } from '@chakra-ui/react'

const DirContent = ({ children }) => {
  return (
    <Box
      id="menu-content"
      w="200px"
      height="100%"
      backdropBlur="8px"
      backdropFilter="auto"
      p={2}
      overflow="auto"
      backgroundColor={useColorModeValue(
        'rgb(255, 250, 240, 0.24)',
        'blackAlpha.400'
      )}
      style={{
        boxShadow: '5px 0px 32px -21px rgba(0,0,0,0.7)'
      }}
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
