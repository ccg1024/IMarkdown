import React, { useState, useRef } from 'react'
import { Box, Link, useColorModeValue } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { BsReverseLayoutTextSidebarReverse } from 'react-icons/bs'

import FileDirItem from './file-dir-item'
import DirContent from './file-dir-content'

const FixedLeftBar = ({ toggleCallback }) => {
  return (
    <Box
      p={2}
      pt={3}
      id="fixed-side-bar"
      boxShadow="lg"
      backgroundColor={useColorModeValue('black', 'black')}
      color={useColorModeValue('white', 'white')}
    >
      <Link
        textDecoration="none"
        color={useColorModeValue('white', 'white')}
        onClick={toggleCallback}
      >
        <BsReverseLayoutTextSidebarReverse />
      </Link>
    </Box>
  )
}

const FileDir = ({ recentFiles, currentFile, isChange }) => {
  const recentPaths = Object.keys(recentFiles)
  const [isVisible, setIsVisible] = useState(true)
  const barRef = useRef(null)

  const openRecentFile = filePath => {
    window.electronAPI.openRecentFile(filePath)
  }

  const toggleMenuContent = () => {
    setIsVisible(v => !v)
    if (
      barRef.current.style.marginRight === '' ||
      barRef.current.style.marginRight === '200px'
    ) {
      barRef.current.style.marginRight = '0px'
    } else {
      barRef.current.style.marginRight = '200px'
    }
  }

  return (
    <Box
      ref={barRef}
      display="flex"
      flexShrink={0}
      position="relative"
      marginRight="200px"
      transition="margin-right 0.5s"
    >
      <FixedLeftBar toggleCallback={toggleMenuContent} />
      <AnimatePresence mode="wait" initial={false}>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -200 }}
            transition={{ duration: 0.4 }}
          >
            <DirContent>
              {recentPaths.map(item => {
                return (
                  <FileDirItem
                    key={item}
                    title={item}
                    fullpath={item}
                    basename={recentFiles[item].filename}
                    isActive={currentFile === item}
                    isChange={
                      currentFile === item
                        ? isChange
                        : recentFiles[item].isChange
                    }
                    clickCallback={openRecentFile}
                  />
                )
              })}
            </DirContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default FileDir
