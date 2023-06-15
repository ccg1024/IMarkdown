import {
  FC,
  MouseEventHandler,
  ReactElement,
  useLayoutEffect,
  useState
} from 'react'
import { Box, IconButton, useColorModeValue } from '@chakra-ui/react'
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
          WebkitAppRegion: 'no-drag'
        },
        '.title-icon:hover': {
          backgroundColor: useColorModeValue(
            'var(--chakra-colors-gray-800)',
            'var(--chakra-colors-gray-800)'
          )
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
  const [showWinIcon, setShowWinIcon] = useState<boolean>(false)

  useLayoutEffect(() => {
    if (window.ipcAPI.getPlatform() !== 'darwin') {
      setShowWinIcon(true)
    }
  }, [])

  return (
    <>
      <TitleBarStyle />
      <Box
        width="100%"
        className="title-bar"
        display="flex"
        gap={2}
        justifyContent="right"
        alignItems="center"
        minHeight={showWinIcon ? 'unset' : 4}
      >
        {showWinIcon && (
          <>
            <TitleBtn
              icon={<BsDash />}
              ariaLabel="min window"
              fontSize="25px"
              onClick={minWindow}
            />
            <TitleBtn
              icon={<BsSquare />}
              ariaLabel="max window"
              fontSize="12px"
              onClick={maxWindow}
            />
            <TitleBtn
              icon={<BsX />}
              ariaLabel="close window"
              fontSize="25px"
              onClick={closeWindow}
            />
          </>
        )}
      </Box>
    </>
  )
}

interface TitleBtnProps {
  icon: ReactElement
  ariaLabel: string
  fontSize: string
  onClick: MouseEventHandler
}

const TitleBtn: FC<TitleBtnProps> = ({
  icon,
  ariaLabel,
  fontSize,
  onClick
}): JSX.Element => {
  return (
    <IconButton
      onClick={onClick}
      icon={icon}
      aria-label={ariaLabel}
      size="sm"
      fontSize={fontSize}
      borderRadius="unset"
      backgroundColor="unset"
      className="title-icon"
    />
  )
}

export default TitleBar
