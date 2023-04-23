import React, { useState } from 'react'
import { Box, Link } from '@chakra-ui/react'
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
      backgroundColor="blue.50"
    >
      <Link textDecoration="none" color="black" onClick={toggleCallback}>
        <BsReverseLayoutTextSidebarReverse />
      </Link>
    </Box>
  )
}

const FileDir = ({ recentFiles, currentFile, isChange }) => {
  const recentPaths = Object.keys(recentFiles)
  const [isVisible, setIsVisible] = useState(true)

  const openRecentFile = filePath => {
    window.electronAPI.openRecentFile(filePath)
  }

  const toggleMenuContent = () => {
    setIsVisible(v => !v)
  }

  return (
    <Box display="flex" flexShrink={0}>
      <FixedLeftBar toggleCallback={toggleMenuContent} />
      <AnimatePresence mode="wait" initial={false}>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
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
