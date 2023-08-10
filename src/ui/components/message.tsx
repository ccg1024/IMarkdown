import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Box, Text, useColorModeValue } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import Celebrate from '../img/celebrate.svg'

interface BaseMessageProps {
  [key: `data-${string}`]: string
  children: React.ReactNode
}

type NormalMessageProps = {
  messagePrompt: string
} & BaseMessageProps &
  React.HTMLAttributes<HTMLDivElement>

type MessageProps = Partial<NormalMessageProps>

export interface MessageRefMethod {
  showMessage: Function
}

type CompoundedComponent = React.ForwardRefExoticComponent<
  MessageProps & React.RefAttributes<MessageRefMethod>
> & {
  __IMARKDOWN: boolean
}

const InternalMessage: React.ForwardRefRenderFunction<
  MessageRefMethod,
  MessageProps
> = (props, ref) => {
  const { messagePrompt, children, ...rest } = props
  const [mess, setMess] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [keyValue, setKeyValue] = useState<string>('')
  const timeRef = useRef<number>(null)
  const debounce = useRef<NodeJS.Timeout>(null)
  const oldMessage = useRef<string>(null)
  const colors = {
    backgroundColor: useColorModeValue('gray.200', 'black')
  }

  useImperativeHandle(
    ref,
    () => {
      return {
        showMessage(mess: string) {
          // show message
          if (oldMessage.current == null) {
            oldMessage.current = mess
          }
          if (!isVisible) {
            setIsVisible(true)
          }
          const current = new Date()

          if (
            timeRef.current == null ||
            current.valueOf() - timeRef.current > 3000 ||
            mess !== oldMessage.current
          ) {
            if (debounce.current) {
              clearTimeout(debounce.current)
            }
            timeRef.current = current.valueOf()
            setMess(mess)
            setKeyValue(current.toLocaleString())
            oldMessage.current = mess
          }

          debounce.current = setTimeout(() => {
            setIsVisible(false)
          }, 3000)
        }
      }
    },
    [messagePrompt, isVisible]
  )

  let messageNode = (
    <>
      <AnimatePresence mode="wait" initial={true}>
        {isVisible && (
          <motion.div
            key={keyValue}
            initial={{ top: 40, opacity: 0 }}
            animate={{ top: 20, opacity: 1 }}
            exit={{ top: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', top: 0, right: 0, zIndex: 1000 }}
          >
            <Box
              borderRadius="md"
              padding={2}
              marginRight={2}
              boxShadow="lg"
              backgroundColor={colors.backgroundColor}
              {...rest}
            >
              <Box display="flex" gap={2} alignItems="center">
                <Celebrate style={{ width: '1em', height: '1em' }} />
                <Text lineHeight={1}>{mess}</Text>
              </Box>
              {children && <Box>{children}</Box>}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  return <>{createPortal(messageNode, document.body)}</>
}

const Message = forwardRef<MessageRefMethod, MessageProps>(
  InternalMessage
) as CompoundedComponent
Message.__IMARKDOWN = true

export default Message
