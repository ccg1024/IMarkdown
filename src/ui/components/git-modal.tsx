import { FC, useState } from 'react'
import {
  Box,
  Text,
  Input,
  Modal,
  ModalBody,
  InputGroup,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  InputLeftElement,
  InputRightElement
} from '@chakra-ui/react'
import { BsOption, BsSlashCircle, BsArrow90DegRight } from 'react-icons/bs'

import { formatGitOut } from '../libs/tools'

interface GitModalProps {
  isOpen: boolean
  onClose: () => void
  cwd: string
}

const GitModal: FC<GitModalProps> = props => {
  const { isOpen, onClose, cwd } = props
  const [command, setCommand] = useState('')
  const [commandOut, setCommandOut] = useState('')
  const [isEnable, setIsEnable] = useState(true)

  const runCommand = () => {
    if (!isEnable) {
      return
    }
    if (command) {
      setIsEnable(false)
      window.ipcAPI
        .gitPipeline({ type: 'command', cwd, command })
        .then(res => {
          setCommandOut(formatGitOut(res.out))
        })
        .catch(err => {
          if (typeof err === 'string') {
            setCommandOut(err)
          } else if (typeof err === 'object') {
            setCommandOut(err.message)
          }
        })
        .finally(() => {
          setIsEnable(true)
        })
    }
  }
  const clearOuts = () => {
    if (!isEnable) {
      return
    }
    setCommandOut('')
  }
  const close = () => {
    setCommandOut('')
    setCommand('')
    onClose()
    if (!isEnable) {
      window.ipcAPI.gitPipeline({ type: 'abort' })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      closeOnOverlayClick={false}
      scrollBehavior="inside"
      autoFocus={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Input command</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <BsOption />
            </InputLeftElement>
            <Input
              pr={14}
              name="command"
              value={command}
              onChange={e => setCommand(e.target.value)}
              disabled={!isEnable}
            />
            <InputRightElement width={14} gap={2}>
              <Box
                onClick={runCommand}
                _hover={{ cursor: isEnable ? 'pointer' : 'not-allowed' }}
              >
                <BsArrow90DegRight />
              </Box>
              <Box
                onClick={clearOuts}
                _hover={{ cursor: isEnable ? 'pointer' : 'not-allowed' }}
              >
                <BsSlashCircle />
              </Box>
            </InputRightElement>
          </InputGroup>
          <Text marginTop={2} whiteSpace="pre-wrap">
            {commandOut}
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default GitModal
