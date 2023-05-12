import React from 'react'
import { Link, ListItem, Flex, Text } from '@chakra-ui/react'
import { BsFillRecordFill } from 'react-icons/bs'

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
      borderRadius="sm"
      backgroundColor={isActive ? 'blue.500' : 'unset'}
      onClick={isActive ? () => {} : e => clickCallback(e.currentTarget.id)}
      _hover={{
        backgroundColor: isActive ? 'blue.500' : 'blue.50',
        cursor: 'pointer'
      }}
    >
      <Flex alignItems="center" overflow="hidden">
        <Text
          ml={1}
          padding={2}
          fontSize="1em"
          userSelect="none"
          flexShrink={0}
          color={isActive ? 'white' : 'black'}
        >
          {basename}
        </Text>
      </Flex>
    </ListItem>
  )
}

export default FileDirItem
