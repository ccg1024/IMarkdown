import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/docco'
import {
  Box,
  Text,
  Heading,
  Link,
  useColorModeValue,
  Image,
  ListItem,
  OrderedList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  UnorderedList,
  Code
} from '@chakra-ui/react'

export function RemarkText(props) {
  return (
    <Text marginY="1em" data-line={props.position.start.line}>
      {props.children}
    </Text>
  )
}

export function RemarkHeading(props) {
  return (
    <Heading
      as={props.tagName}
      fontSize={'1.' + (6 - props.tagName.replace('h', '')) + 'em'}
      marginBottom="1em"
      textDecoration="underline"
      textUnderlineOffset="8px"
      textDecorationThickness="4px"
      textDecorationColor="gray.200"
      data-line={props.position.start.line}
    >
      {props.children}
    </Heading>
  )
}

export function RemarkQuote(props) {
  return (
    <Box
      overflow="auto"
      borderRadius="md"
      backgroundColor={useColorModeValue('gray.100', 'whiteAlpha.200')}
      padding="0.5em"
      marginY="1em"
      boxShadow="lg"
      data-line={props.position.start.line}
      data-endline={props.position.end.line}
    >
      {props.children}
    </Box>
  )
}

export function RemarkLink(props) {
  return <Link data-line={props.position.start.line}>{props.children}</Link>
}

export function RemarkUl(props) {
  return (
    <UnorderedList
      data-line={props.position.start.line}
      data-endline={props.position.end.line}
    >
      {props.children}
    </UnorderedList>
  )
}

export function RemarkOl(props) {
  return (
    <OrderedList
      data-line={props.position.start.line}
      data-endline={props.position.end.line}
    >
      {props.children}
    </OrderedList>
  )
}

export function RemarkLi(props) {
  return (
    <ListItem data-line={props.position.start.line}>{props.children}</ListItem>
  )
}

export function RemarkImg(props) {
  const path = window.electronAPI.require('path')
  let imgSrc = props.src
  const openedPath = props.openedPath

  if (imgSrc.startsWith('.')) {
    let nameLen = path.basename(openedPath).length
    let pathPre = openedPath.substring(0, openedPath.length - nameLen)
    imgSrc = pathPre + imgSrc
  }

  return (
    <Image
      src={'atom:///' + imgSrc}
      borderRadius="md"
      boxShadow="lg"
      m="auto"
      marginY="1em"
      data-line={props.position.start.line}
    />
  )
}

export function RemarkTable(props) {
  return (
    <TableContainer
      marginY={2}
      data-line={props.position.start.line}
      data-endline={props.position.end.line}
    >
      <Table variant="simple" textAlign="left">
        {props.children}
      </Table>
    </TableContainer>
  )
}

export function RemarkThead(props) {
  return <Thead>{props.children}</Thead>
}

export function RemarkTbody(props) {
  return <Tbody>{props.children}</Tbody>
}

export function RemarkTr(props) {
  return <Tr data-line={props.position.start.line}>{props.children}</Tr>
}

export function RemarkTd(props) {
  return <Td>{props.children}</Td>
}

export function RemarkTh(props) {
  return <Th>{props.children}</Th>
}

export function RemarkCodePre(props) {
  return (
    <Box
      as="pre"
      data-line={props.position.start.line}
      data-endline={props.position.end.line}
    >
      {props.children}
    </Box>
  )
}

export function RemarkCode(props) {
  const { inline, className } = props
  const match = /language-(\w+)/.exec(className || '')
  return !inline && match ? (
    <SyntaxHighlighter
      data-line={props.position.start.line}
      data-endline={props.position.end.line}
      style={docco}
      language={match[1]}
      showLineNumbers="true"
      PreTag="div"
      customStyle={{
        marginTop: '10px',
        marginBottom: '10px',
        borderRadius: '5px'
      }}
    >
      {String(props.children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <Code
      fontWeight="bold"
      color={useColorModeValue('#3D7AED', '#FF63C3')}
      className={className}
      fontSize="1em"
      backgroundColor="unset"
    >
      {props.children}
    </Code>
  )
}
