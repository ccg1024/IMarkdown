import { FC, MouseEventHandler, ReactNode, useEffect, useRef } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import { BsLayoutSplit, BsEye, BsPencil } from 'react-icons/bs'

interface Props {
  livePreviewCallback: MouseEventHandler
  justPreviewCallback: MouseEventHandler
  justEditorCallback: MouseEventHandler
}

interface IconBoxProps {
  children: ReactNode
  clickCallback: MouseEventHandler
}

const IconBox: FC<IconBoxProps> = (props): JSX.Element => {
  return (
    <Box
      boxShadow="lg"
      onClick={props.clickCallback}
      borderRadius="full"
      padding={2}
      zIndex={1}
      backgroundColor={useColorModeValue('white', 'black')}
      _hover={{
        cursor: 'pointer',
        backgroundColor: useColorModeValue('gray.200', 'whiteAlpha.200')
      }}
    >
      {props.children}
    </Box>
  )
}

const InterIcon: FC<Props> = props => {
  const interIconRef = useRef<HTMLDivElement>(null)
  const timer = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    const { current: container } = interIconRef
    function mouseEnter() {
      if (timer && timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
      container.style.opacity = '1'
    }
    function mouseLeave() {
      timer.current = setTimeout(() => {
        container.style.opacity = '0'
      }, 1000)
    }

    function clear() {
      container.removeEventListener('mouseenter', mouseEnter)
      container.removeEventListener('mouseleave', mouseLeave)
    }
    if (container) {
      container.addEventListener('mouseenter', mouseEnter)
      container.addEventListener('mouseleave', mouseLeave)

      return clear
    }
  }, [])

  return (
    <Box
      opacity={0}
      ref={interIconRef}
      display="flex"
      gap={2}
      position="absolute"
      bottom="2em"
      right="1em"
      flexDirection="column"
    >
      <IconBox clickCallback={props.justPreviewCallback}>
        <BsEye />
      </IconBox>
      <IconBox clickCallback={props.justEditorCallback}>
        <BsPencil />
      </IconBox>
      <IconBox clickCallback={props.livePreviewCallback}>
        <BsLayoutSplit />
      </IconBox>
    </Box>
  )
}

export default InterIcon
