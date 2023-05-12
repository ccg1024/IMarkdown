import React, { useState, useRef } from 'react'
import { Box, List, ListItem, useColorModeValue } from '@chakra-ui/react'

import FileDirItem from './file-dir-item'
import DirContent from './file-dir-content'
import uiColor from '../libs/colors'

const FixedLeftBar = () => {
  return (
    <Box
      id="fixed-side-bar"
      boxShadow="lg"
      backgroundColor={useColorModeValue(
        uiColor.leftSideBarFixed.backgroundColorLight,
        uiColor.leftSideBarFixed.backgroundColorDark
      )}
      color={useColorModeValue('gray.300', 'gray.300')}
      width="40%"
    >
      <List>
        <ListItem
          padding={2}
          fontSize="1.2em"
          textAlign="center"
          userSelect="none"
          backgroundColor={uiColor.leftSideBarFixed.activeColorLight}
          _hover={{ cursor: 'pointer' }}
        >
          Recent Files
        </ListItem>
      </List>
    </Box>
  )
}

const FileDir = ({ recentFiles, currentFile, isChange }) => {
  const recentPaths = Object.keys(recentFiles)

  const openRecentFile = filePath => {
    window.electronAPI.openRecentFile(filePath)
  }

  return (
    <Box id="side-bar" display="flex" flexShrink={0} width="40%">
      <FixedLeftBar />
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
                currentFile === item ? isChange : recentFiles[item].isChange
              }
              clickCallback={openRecentFile}
            />
          )
        })}
      </DirContent>
    </Box>
  )
}

export default FileDir
