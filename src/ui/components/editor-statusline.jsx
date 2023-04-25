import PubSub from 'pubsub-js'
import { BsBell } from 'react-icons/bs'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
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
  const [modifyIcon, setModifyIcon] = useState('')
  const [messageHistory, setMessageHistory] = useState([])

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    let token = PubSub.subscribe(PubSubConfig.statusLineInfo, (_msg, data) => {
      setCurrentLine(data.current)
      setTotalLine(data.total)
    })
    let token2 = PubSub.subscribe(
      PubSubConfig.statusLineModify,
      (_msg, isModify) => {
        if (isModify) {
          setModifyIcon('[+]')
        } else {
          setModifyIcon('')
        }
      }
    )
    let token3 = PubSub.subscribe(
      PubSubConfig.statusLineClear,
      (_msg, ifClear) => {
        if (ifClear) {
          setMessage('')
        }
      }
    )

    return () => {
      PubSub.unsubscribe(token)
      PubSub.unsubscribe(token2)
      PubSub.unsubscribe(token3)
    }
  }, [])

  useEffect(() => {
    window.electronAPI.sendSavedInfo((_event, info, err) => {
      if (err) {
        setMessage([info, '[GotError]', err, messageTime()].join(' '))
        setMessageHistory(v => [
          ...v,
          [info, '[GotError]', err, messageTime() + '\n'].join(' ')
        ])
      } else {
        setMessage([info, messageTime()].join(' '))
        setMessageHistory(v => [...v, [info, messageTime() + '\n'].join(' ')])
      }
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
          <Text whiteSpace="nowrap" pr={1}>
            {modifyIcon}
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
          <ModalBody>{messageHistory}</ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default EditorStatusline