import PubSub from 'pubsub-js'
import { BsBell } from 'react-icons/bs'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  Modal,
  Button,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'

import PubSubConfig from '../../config/frontend'

function messageTime() {
  const current = new Date()
  const hour =
    current.getHours() > 9 ? current.getHours() : '0' + current.getHours()
  const min =
    current.getMinutes() > 9 ? current.getMinutes() : '0' + current.getMinutes()
  const sec =
    current.getSeconds() > 9 ? current.getSeconds() : '0' + current.getSeconds()

  return [hour, min, sec].join(':')
}

const EditorStatusline = () => {
  const [message, setMessage] = useState('')
  const [currentLine, setCurrentLine] = useState(1)
  const [totalLine, setTotalLine] = useState(1)

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    let token = PubSub.subscribe(PubSubConfig.statusLineInfo, (_msg, data) => {
      setCurrentLine(data.current)
      setTotalLine(data.total)
    })

    return () => {
      PubSub.unsubscribe(token)
    }
  }, [])

  useEffect(() => {
    window.electronAPI.sendSavedInfo((_event, info, err) => {
      if (err) {
        setMessage(info + '[GotError]' + err)
      }
      setMessage([info, messageTime()].join(' '))
    })

    return () => {
      window.electronAPI.removeSendSavedInfo()
    }
  }, [])

  return (
    <>
      <Flex
        backgroundColor="green.300"
        justifyContent="space-between"
        paddingX={2}
      >
        <Box display="flex" overflow="hidden" flexGrow={1}>
          <Text whiteSpace="nowrap" pr={1}>
            IPC
          </Text>
          <Box
            display="flex"
            overflow="hidden"
            backgroundColor="blue.50"
            px={1}
            flexGrow={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Text textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
              {message}
            </Text>
            <Box onClick={onOpen} flexShrink={0} _hover={{ cursor: 'pointer' }}>
              <BsBell />
            </Box>
          </Box>
        </Box>
        <Box whiteSpace="nowrap" pl={1} display="flex">
          <Text pr={1}>LN</Text>
          <Text>{currentLine}</Text>
          <Text>:</Text>
          <Text>{totalLine}</Text>
        </Box>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>The message from main process</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{message}</ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default EditorStatusline
