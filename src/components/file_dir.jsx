import React, { useEffect, useRef } from 'react'
import {
  Box,
  Flex,
  Text,
  Link,
  List,
  ListItem,
  useColorModeValue
} from '@chakra-ui/react'
import {
  BsFillRecordFill,
  BsReverseLayoutTextSidebarReverse
} from 'react-icons/bs'

const FileDir = ({ recentFiles, currentFile, isChange, handlePath }) => {
  const menuRef = useRef(null)
  const path = window.electronAPI.require('path')

  const converWin32Path = filePath =>
    filePath.split(path.sep).join(path.posix.sep)

  const readRecentFile = filePath => {
    if (isChange) {
      // alert('the file is unsaved');
      window.electronAPI.showUnsavedInfo()
      return
    }
    // console.log('Using recent file: ' + filePath)
    handlePath(filePath) // activate useEffect in App.js
    window.electronAPI.setFilePath(filePath)
  }

  useEffect(() => {
    if (
      isChange &&
      currentFile !== null &&
      currentFile !== undefined &&
      currentFile !== ''
    ) {
      // change current file color
      // console.log("The file is change ", isChange);
      // console.log("conver path: ", converWin32Path(currentFile));
      const targetDom = document.getElementById(converWin32Path(currentFile))
      const iconDom = targetDom.getElementsByTagName('svg')[0]
      iconDom.style.color = '#E53E3E'

      // send info to main process
      window.electronAPI.setContentChange(true)
    }
  }, [isChange, currentFile])

  const toggleMenuContent = () => {
    if (menuRef.current.style.display === 'none') {
      menuRef.current.style.display = 'block'
    } else {
      menuRef.current.style.display = 'none'
    }
  }

  return (
    <>
      <Box
        p={2}
        pt={3}
        id="fixed-side-bar"
        boxShadow="lg"
        backgroundColor="blue.50"
      >
        <Link textDecoration="none" color="black" onClick={toggleMenuContent}>
          <BsReverseLayoutTextSidebarReverse />
        </Link>
      </Box>
      <Box
        id="menu-content"
        ref={menuRef}
        w="200px"
        backdropBlur="8px"
        backdropFilter="auto"
        p={2}
        overflow="auto"
        backgroundColor={useColorModeValue(
          'rgb(255, 250, 240, 0.24)',
          'blackAlpha.400'
        )}
        style={{
          boxShadow: '5px 0px 32px -21px rgba(0,0,0,0.7)'
        }}
      >
        <Flex
          alignItems="center"
          justifyContent="center"
          borderBottom="2px"
          borderBottomColor="whiteAlpha.600"
        >
          <Text
            as="h1"
            textAlign="center"
            px={2}
            fontWeight="bold"
            userSelect={'none'}
          >
            recent files
          </Text>
        </Flex>
        <List>
          {recentFiles.map((item, index) => {
            if (converWin32Path(currentFile) === item) {
              return (
                <Link
                  key={index}
                  href="#"
                  textDecoration="none"
                  color="black"
                  _hover={{ textDecoration: 'none' }}
                  title={item}
                >
                  <ListItem
                    p={1}
                    id={item}
                    key={index}
                    borderRadius="sm"
                    backgroundColor="blackAlpha.400"
                  >
                    <Flex alignItems="center" key={index} overflow={'hidden'}>
                      <BsFillRecordFill
                        color="#68d391"
                        style={{ flexShrink: 0 }}
                      />
                      <Text ml={1} userSelect={'none'} flexShrink={0}>
                        {path.basename(item)}
                      </Text>
                    </Flex>
                  </ListItem>
                </Link>
              )
            } else {
              return (
                <Link
                  key={index}
                  href="#"
                  textDecoration="none"
                  color="black"
                  _hover={{ textDecoration: 'none' }}
                  title={item}
                >
                  <ListItem
                    p={1}
                    id={item}
                    key={index}
                    borderRadius="sm"
                    onClick={e => readRecentFile(e.currentTarget.id)}
                    _hover={{ backgroundColor: 'blackAlpha.200' }}
                  >
                    <Flex alignItems="center" key={index} overflow="hidden">
                      <BsFillRecordFill
                        color="#718096"
                        style={{ flexShrink: 0 }}
                      />
                      <Text ml={1} userSelect={'none'} flexShrink={0}>
                        {path.basename(item)}
                      </Text>
                    </Flex>
                  </ListItem>
                </Link>
              )
            }
          })}
        </List>
      </Box>
    </>
  )
}

export default FileDir
