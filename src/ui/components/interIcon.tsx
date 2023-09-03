import { FC, MouseEventHandler, ReactNode, useRef } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import { BsLayoutSplit, BsEye, BsPencil } from 'react-icons/bs'
import { useHoverFade } from '../hooks/useHoverFade'

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

  useHoverFade(interIconRef)

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
