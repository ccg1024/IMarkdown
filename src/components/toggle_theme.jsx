import React from 'react'
import { IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react'

const ThemeToggleButton = () => {
  const { toggleColorMode } = useColorMode()

  return (
    <IconButton
      aria-label='Toggle theme'
      colorScheme={useColorModeValue('purple', 'orange')}
      onClick={toggleColorMode}
    >
    </IconButton>
  )
}


export default ThemeToggleButton
