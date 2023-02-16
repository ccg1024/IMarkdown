import React from "react";
import {
  Box,
  Flex,
  Text,
  Link,
  List,
  ListItem,
  useColorModeValue,
} from "@chakra-ui/react";
import { BsFillFileEarmarkTextFill, BsFillRecordFill } from 'react-icons/bs'

const FileDir = ({ recentFiles, currentFile, handlePath, handleDoc }) => {

  const path = window.electronAPI.require('path')
  const fs = window.electronAPI.require('fs')

  const readRecentFile = (filePath) => {
    console.log("Using recent file: " + filePath)
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) throw err
      else {
        handleDoc(data)
        handlePath(filePath)
        window.electronAPI.setFilePath(filePath)
      }
    })
  }

  return (
    <Box
      w="20%"
      boxShadow='dark-lg'
      backdropBlur='8px'
      backdropFilter='auto'
      p={2}
      overflow='auto'
      backgroundColor={useColorModeValue('rgb(255, 250, 240, 0.24)', 'blackAlpha.400')}
    >
      <Flex
        alignItems="center"
        borderBottom="2px"
        borderBottomColor="whiteAlpha.600"
      >
        <BsFillFileEarmarkTextFill />
        <Text
          as="h1"
          textAlign="left"
          px={2}
          fontWeight="bold"
        >Opened File</Text>
      </Flex>
      <List>
        {
          recentFiles.map((item, index) => {
            if (currentFile === item) {
              return (
                <Link
                  key={index}
                  href="#"
                  textDecoration='none'
                  color='black'
                  _hover={{ textDecoration: 'none' }}
                >
                  <ListItem
                    p={1}
                    key={index}
                    borderRadius="sm"
                    backgroundColor="blackAlpha.400"
                  >
                    <Flex alignItems="center" key={index} >
                      <BsFillRecordFill color="#68d391" />
                      <Text ml={1}>
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
                  textDecoration='none'
                  color='black'
                  _hover={{ textDecoration: 'none' }}
                >
                  <ListItem
                    p={1}
                    id={item}
                    key={index}
                    borderRadius="sm"
                    onClick={e => readRecentFile(e.currentTarget.id)}
                    _hover={{ backgroundColor: 'blackAlpha.200' }}
                  >
                    <Flex alignItems="center" key={index} >
                      <BsFillRecordFill color="#718096" />
                      <Text ml={1}>
                        {path.basename(item)}
                      </Text>
                    </Flex>
                  </ListItem>
                </Link>
              )
            }
          })
        }
      </List>
    </Box>
  )
}

export default FileDir
