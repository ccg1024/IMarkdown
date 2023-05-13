import React from 'react'
import {
  ListItem,
  Flex,
  Text,
  Heading,
  useColorModeValue
} from '@chakra-ui/react'

const FileDirItem = ({
  title,
  fullpath,
  basename,
  isActive,
  isChange,
  clickCallback
}) => {
  return (
    <ListItem
      p={1}
      id={fullpath}
      borderBottom="1px"
      borderStyle="solid"
      borderColor={useColorModeValue('gray.300', 'gray.300')}
      backgroundColor={isActive ? 'blue.500' : 'unset'}
      onClick={isActive ? () => {} : e => clickCallback(e.currentTarget.id)}
      _hover={{
        backgroundColor: isActive ? 'blue.500' : 'blue.50',
        cursor: 'pointer'
      }}
    >
      <Flex
        overflow="hidden"
        alignItems="start"
        flexDirection="column"
        padding={2}
      >
        <Heading
          fontSize="1.5em"
          marginBottom={2}
          fontFamily="inherit"
          color={isActive ? 'white' : 'black'}
        >
          Note Title
        </Heading>
        <Text fontSize="1em" color={isActive ? 'white' : 'black'}>
          2023-5-12
        </Text>
        <Text
          width="100%"
          overflow="hidden"
          fontSize="1em"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          color={isActive ? 'white' : 'black'}
        >
          some infot mation about this note
        </Text>
      </Flex>
    </ListItem>
  )
}

export default FileDirItem
