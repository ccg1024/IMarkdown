import React, { FC, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  Flex,
  Text,
  Tooltip,
  Spinner,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react'
import {
  BsGit,
  BsTerminal,
  BsXCircleFill,
  BsArrowRepeat,
  BsArrowUpCircle
} from 'react-icons/bs'
import { AnimatePresence, motion } from 'framer-motion'

import GitModal from './git-modal'
import { formatGitOut } from '../libs/tools'
import Message, { MessageRefMethod } from './message'
import { selectDirlist } from '../app/reducers/dirlistSlice'
import '../css/git-bar.css'

type GitCommadMsg = {
  stderr: string
  stdout: string
}

const GitBar: FC<React.HTMLAttributes<HTMLDivElement>> = props => {
  const { ...rest } = props
  const dirlist = useSelector(selectDirlist)
  const colors = {
    borderColor: useColorModeValue(
      'var(--chakra-colors-whiteAlpha-200)',
      'var(--chakra-colors-whiteAlpha-200)'
    ),
    color: useColorModeValue('var(--chakra-colors-gray-200)', 'white')
  }
  const [branch, setBranch] = useState('no git branch')
  const [showGit, setShowGit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messageRef = useRef<MessageRefMethod>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const isGitWorkplace = branch !== 'no git branch'

  useEffect(() => {
    if (dirlist && !!dirlist.length) {
      window.ipcAPI
        .gitPipeline({ type: 'head', cwd: dirlist[0].id })
        .then(res => {
          const { out } = res
          const gitMsg = JSON.parse(out) as GitCommadMsg
          setBranch(gitMsg.stdout.trim())
        })
        .catch(() => {
          // TODO: add a message alert
          setBranch('no git branch')
        })
    }
  }, [dirlist])

  const toggleGit = () => {
    if (isGitWorkplace) {
      setShowGit(v => !v)
    }
  }
  const gitPull = () => {
    setShowGit(false)
    setIsLoading(true)
    window.ipcAPI
      .gitPipeline({ type: 'pull', cwd: dirlist[0].id })
      .then(res => {
        messageRef.current.showMessage(formatGitOut(res.out))
      })
      .catch(err => {
        // TODO: add a message alert
        messageRef.current.showMessage('[ERROR]\n' + err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const gitPush = () => {
    setShowGit(false)
    setIsLoading(true)
    window.ipcAPI
      .gitPipeline({ type: 'push', cwd: dirlist[0].id })
      .then(res => {
        messageRef.current.showMessage(formatGitOut(res.out))
      })
      .catch(err => {
        // TODO: add a message alert
        messageRef.current.showMessage('[ERROR]\n' + err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  const openTerminal = () => {
    setShowGit(false)
    onOpen()
  }

  const gitOperation = isGitWorkplace && (
    <AnimatePresence mode="wait" initial={false}>
      {showGit && (
        <motion.div
          initial={{ top: 20, opacity: 0 }}
          animate={{ top: 0, opacity: 1 }}
          exit={{ top: 20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="git_operation_container"
        >
          <GitIconWrapper tooltip="pull" clickFn={gitPull}>
            <BsArrowRepeat className="git_operation hover_cursor" />
          </GitIconWrapper>
          <GitIconWrapper tooltip="push" clickFn={gitPush}>
            <BsArrowUpCircle className="git_operation hover_cursor" />
          </GitIconWrapper>
          <GitIconWrapper tooltip="terminal" clickFn={openTerminal}>
            <BsTerminal className="git_operation hover_cursor" />
          </GitIconWrapper>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <Box
      padding={4}
      borderStyle="solid"
      borderColor={colors.borderColor}
      borderTopWidth="1px"
      color={colors.color}
      position="relative"
      {...rest}
    >
      <Flex
        opacity={isLoading ? 0.5 : 1}
        position="relative"
        gap={2}
        alignItems="center"
        lineHeight="normal"
      >
        <BsGit
          onClick={toggleGit}
          className={isGitWorkplace && 'hover_cursor'}
        />
        <Text lineHeight="normal">{branch}</Text>
        {gitOperation}
      </Flex>
      {isLoading && <Mask />}
      <Message ref={messageRef} />
      <GitModal
        isOpen={isOpen}
        onClose={onClose}
        cwd={isGitWorkplace ? dirlist[0].id : ''}
      />
    </Box>
  )
}

interface GitIconWrapperProps {
  tooltip?: string
  openDelay?: number
  clickFn?: () => void
  children?: React.ReactNode
}

const GitIconWrapper: FC<GitIconWrapperProps> = props => {
  const { tooltip, openDelay, clickFn, children } = props
  const colors = {
    background: useColorModeValue(
      'var(--chakra-colors-whiteAlpha-400)',
      'var(--chakra-colors-whiteAlpha-400)'
    )
  }

  return (
    <Tooltip
      label={tooltip ?? 'git icon'}
      openDelay={openDelay ?? 1000}
      placement="auto"
    >
      <Box
        onClick={clickFn ?? undefined}
        borderRadius="full"
        _hover={{ backgroundColor: colors.background }}
      >
        {children}
      </Box>
    </Tooltip>
  )
}

const Mask: FC = () => {
  const close = () => {
    window.ipcAPI.gitPipeline({ type: 'abort' }).catch(() => {
      // catch err ?
    })
  }

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      backgroundColor="whiteAlpha.200"
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Spinner />
      <Box
        onClick={close}
        color="blackAlpha.600"
        position="absolute"
        right={0}
        top={0}
        marginTop={1}
        marginRight={1}
        _hover={{ color: 'black', cursor: 'pointer' }}
      >
        <BsXCircleFill />
      </Box>
    </Box>
  )
}

export default GitBar
