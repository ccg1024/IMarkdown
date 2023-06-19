import { FC, MouseEventHandler, ReactNode } from 'react'
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
      onClick={props.clickCallback}
      borderWidth="1px"
      borderRadius="full"
      borderColor="gray.200"
      borderStyle="solid"
      padding={2}
      zIndex={1}
      opacity="0.4"
      _hover={{
        opacity: '1',
        backgroundColor: useColorModeValue('white', 'black'),
        cursor: 'pointer'
      }}
    >
      {props.children}
    </Box>
  )
}

const InterIcon: FC<Props> = props => {
  return (
    <Box
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
