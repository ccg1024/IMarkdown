import { FC } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import { Global } from '@emotion/react'
import { BsX, BsDash, BsSquare } from 'react-icons/bs'

const TitleBarStyle: FC = (): JSX.Element => {
  return (
    <Global
      styles={{
        '.title-bar': {
          WebkitAppRegion: 'drag'
        },
        '.title-icon': {
          marginLeft: 'var(--chakra-space-2)',
          WebkitAppRegion: 'no-drag',
          color: useColorModeValue(
            'var(--chakra-colors-gray-500)',
            'var(--chakra-colors-gray-500)'
          )
        },
        '.title-icon:hover': {
          color: useColorModeValue(
            'var(--chakra-colors-gray-800)',
            'var(--chakra-colors-gray-800)'
          ),
          cursor: 'pointer',
          transform: 'scale(1.2, 1.2)'
        }
      }}
    />
  )
}

function closeWindow(): void {
  window.ipcAPI.closeWindow()
}
function minWindow(): void {
  window.ipcAPI.minimizeWindow()
}
function maxWindow(): void {
  window.ipcAPI.maximizeWindow()
}

const TitleBar: FC = (): JSX.Element => {
  return (
    <>
      <TitleBarStyle />
      <Box
        position="absolute"
        width="100%"
        className="title-bar"
        display="flex"
        gap={2}
        justifyContent="right"
        paddingX={4}
        alignItems="center"
      >
        <BsDash fontSize="30px" className="title-icon" onClick={minWindow} />
        <BsSquare fontSize="15px" className="title-icon" onClick={maxWindow} />
        <BsX fontSize="30px" className="title-icon" onClick={closeWindow} />
      </Box>
    </>
  )
}

export default TitleBar
