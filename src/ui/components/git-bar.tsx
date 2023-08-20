import React, { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Box, Flex, Text, Tooltip, useColorModeValue } from '@chakra-ui/react'
import { BsGit, BsArrowRepeat, BsArrowUpCircle } from 'react-icons/bs'
import { AnimatePresence, motion } from 'framer-motion'

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
      'var(--chakra-colors-gray-200)',
      'var(--chakra-colors-whiteAlpha-200)'
    ),
    color: useColorModeValue('var(--chakra-colors-gray-200)', 'white')
  }
  const [branch, setBranch] = useState('no git branch')
  const [showGit, setShowGit] = useState(false)

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
    window.ipcAPI
      .gitPipeline({ type: 'pull', cwd: dirlist[0].id })
      .then(res => {
        console.log(res)
      })
      .catch(() => {
        // TODO: add a message alert
      })
  }

  const gitPush = () => {
    window.ipcAPI
      .gitPipeline({ type: 'push', cwd: dirlist[0].id })
      .then(res => {
        console.log(res)
      })
      .catch(() => {
        // TODO: add a message alert
      })
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
      {...rest}
    >
      <Flex position="relative" gap={2} alignItems="center" lineHeight="normal">
        <BsGit
          onClick={toggleGit}
          className={isGitWorkplace && 'hover_cursor'}
        />
        <Text lineHeight="normal">{branch}</Text>
        {gitOperation}
      </Flex>
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
      'var(--chakra-colors-gray-200)',
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

export default GitBar
