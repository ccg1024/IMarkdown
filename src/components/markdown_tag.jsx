import React from 'react'
import {
  Box,
  Link,
  Text,
  Image,
  ListItem,
  OrderedList,
  UnorderedList,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Code
} from '@chakra-ui/react'

export const MarkdownDiv = ({ props, children }) => {
  return (
    <Box {...props}>
      {children}
    </Box>
  )
}


export const Quote = ({ children }) => {
  return (
    <Box
      borderRadius='5px'
      bg='rgba(255, 255, 255, 0.12)'
      pl={2}
      pr={2}
      mt={2}
      mb={2}
      pt='1px'
      pb='1px'
    >
      {children}
    </Box>
  )
}

export const MarkdownLink = ({ href, props, children }) => {
  return (
    <Link href={href} textAlign="justify" {...props} color='#ff63c3' textUnderlineOffset={3}>
      {children}
    </Link>
  )
}

export const MarkdownTable = ({ children }) => {
  return (
    <TableContainer mb={2} mt={2}>
      <Table variant='simple' textAlign='left'>
        {children}
      </Table>
    </TableContainer>
  )
}

export const MarkdownThead = ({ props, children }) => {
  return (
    <Thead {...props}>
      {children}
    </Thead>
  )
}

export const MarkdownTbody = ({ props, children }) => {
  return (
    <Tbody {...props}>
      {children}
    </Tbody>
  )
}

export const MarkdownTr = ({ props, children }) => {
  return (
    <Tr {...props}>
      {children}
    </Tr>
  )
}

export const MarkdownTh = ({ props, children }) => {
  return (
    <Th {...props}>
      {children}
    </Th>
  )
}

export const MarkdownTd = ({ props, children }) => {
  return (
    <Td {...props}>
      {children}
    </Td>
  )
}

export const MarkdownText = ({ props, children }) => {
  return (
    <Text align="justify" {...props}>
      {children}
    </Text>
  )
}

export const MarkdownImage = ({ src, props, children }) => {
  return (
    <Image src={src} {...props}>
      {children}
    </Image>
  )
}

export const MarkdownListItem = ({ props, children }) => {
  return (
    <ListItem textAlign='justify' {...props}>
      {children}
    </ListItem>
  )
}

export const MarkdownUList = ({ props, children }) => {
  return (
    <UnorderedList
      p={0}
      {...props}
    >
      {children}
    </UnorderedList>
  )
}

export const MarkdownOList = ({ props, children }) => {
  return (
    <OrderedList
      p={0}
      {...props}
    >
      {children}
    </OrderedList>
  )
}

export const MarkdownCode = ({ props, children }) => {
  return (
    <Code
      background="whiteAlpha.400"
      color='#ff63c3'
      fontWeight='bold'
      {...props}
    >
      {children}
    </Code>
  )
}
