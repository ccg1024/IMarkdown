import PubSub from 'pubsub-js'
import { BsBell } from 'react-icons/bs'
import { useState, useEffect } from 'react'
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

import pubsubConfig from '../../config/pubsub.config'
import { LineOfStatusLine } from 'src/types'

function getCurrentTime(): string {
  const date = new Date()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${hour}:${minute}:${second}`
}

const StatusLine = (): JSX.Element => {
  const [message, setMessage] = useState<string>('')
  const [currentLine, setCurrentLine] = useState<number>(1)
  const [totalLines, setTotalLines] = useState<number>(1)
  const [modifyIcon, setModifyIcon] = useState<string>('')
  const [messageHistory, setMessageHistory] = useState<string[]>([])

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const token = PubSub.subscribe(
      pubsubConfig.STATUS_LINE_INFO,
      (_, data: LineOfStatusLine) => {
        setCurrentLine(data.current)
        setTotalLines(data.total)
      }
    )

    const token2 = PubSub.subscribe(
      pubsubConfig.UPDATE_STATUS_LINE,
      (_, isModify: boolean) => {
        if (isModify) {
          setModifyIcon('[+]')
        } else {
          setModifyIcon('')
        }
      }
    )
    const token3 = PubSub.subscribe(pubsubConfig.CLEAR_STATUS_LINE, () => {
      setMessage('')
    })

    return () => {
      PubSub.unsubscribe(token)
      PubSub.unsubscribe(token2)
      PubSub.unsubscribe(token3)
    }
  }, [])

  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    window.ipcAPI.listenSendSaveInfo((_event: any, info: string, err: any) => {
      if (err) {
        setMessage([info, '[GotError]', err, getCurrentTime()].join(' '))
        setMessageHistory(v => [
          ...v,
          [info, '[GotError]', err, getCurrentTime() + '\n'].join(' ')
        ])
      } else {
        setMessage([info, getCurrentTime()].join(' '))
        setMessageHistory(v => [
          ...v,
          [info, getCurrentTime() + '\n'].join(' ')
        ])
      }
    })

    return () => {
      window.ipcAPI.removeSendSaveInfoListener()
    }
  }, [])
  return (
    <>
      <Flex
        backgroundColor="gray.200"
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
            backgroundColor="#f7f7f7"
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
          <Text>{totalLines}</Text>
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

export default StatusLine
