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
    <Link
      href="#"
      color="black"
      title={title}
      textDecoration="none"
      _hover={{ textDecoration: 'none' }}
    >
      <ListItem
        p={1}
        id={fullpath}
        borderRadius="sm"
        backgroundColor={isActive ? 'blue.100' : ''}
        onClick={isActive ? () => {} : e => clickCallback(e.currentTarget.id)}
        _hover={!isActive ? { backgroundColor: 'blue.50' } : ''}
      >
        <Flex alignItems="center" overflow="hidden">
          <BsFillRecordFill
            color={isChange ? '#F56565' : isActive ? '#48BB78' : '#C6F6D5'}
            style={{ flexShrink: 0 }}
          />
          <Text ml={1} userSelect="none" flexShrink={0}>
            {basename}
          </Text>
        </Flex>
      </ListItem>
    </Link>
  )
}

export default FileDirItem
