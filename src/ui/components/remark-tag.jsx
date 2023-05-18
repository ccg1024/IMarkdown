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
  Code,
  Divider
} from '@chakra-ui/react'

function getStartLine(node) {
  return node.position.start.line
}
function getEndLine(node) {
  return node.position.end.line
}

export function RemarkText(props) {
  let dataLine
  if (props.node) {
    dataLine = getStartLine(props.node)
  }
  return (
    <Text marginY="1em" data-line={dataLine}>
      {props.children}
    </Text>
  )
}

export function RemarkHeading(props) {
  let dataLine
  let tagName = 'h1'
  if (props.node) {
    dataLine = getStartLine(props.node)
    tagName = props.node.tagName
  }
  return (
    <Heading
      as={tagName}
      fontSize={'1.' + (6 - tagName.replace('h', '')) + 'em'}
      fontFamily="inherit"
      marginTop="1em"
      marginBottom="1em"
      textDecoration="underline"
      textUnderlineOffset="8px"
      textDecorationThickness="4px"
      textDecorationColor="gray.200"
      data-line={dataLine}
    >
      {props.children}
    </Heading>
  )
}

export function RemarkQuote(props) {
  let dataLine, endLine
  if (props.node) {
    dataLine = getStartLine(props.node)
    endLine = getEndLine(props.node)
  }
  return (
    <Box
      overflow="auto"
      borderRadius="md"
      backgroundColor={useColorModeValue('gray.100', 'whiteAlpha.200')}
      padding="0.5em"
      marginY="1em"
      boxShadow="md"
      data-line={dataLine}
      data-endline={endLine}
    >
      {props.children}
    </Box>
  )
}

export function RemarkLink(props) {
  let dataLine = props.node && getStartLine(props.node)
  return <Link data-line={dataLine}>{props.children}</Link>
}

export function RemarkUl(props) {
  let dataLine = props.node && getStartLine(props.node)
  let endLine = props.node && getEndLine(props.node)
  return (
    <UnorderedList data-line={dataLine} data-endline={endLine}>
      {props.children}
    </UnorderedList>
  )
}

export function RemarkOl(props) {
  return (
    <OrderedList
      data-line={props.node && getStartLine(props.node)}
      data-endline={props.node && getEndLine(props.node)}
    >
      {props.children}
    </OrderedList>
  )
}

export function RemarkLi(props) {
  return (
    <ListItem data-line={props.node && getStartLine(props.node)}>
      {props.children}
    </ListItem>
  )
}

export function RemarkImg(props) {
  return (
    <Image
      src={'atom://' + props.src}
      borderRadius="md"
      boxShadow="lg"
      m="auto"
      marginY="1em"
      data-line={props.node && getStartLine(props.node)}
    />
  )
}

export function RemarkTable(props) {
  return (
    <TableContainer
      marginY={2}
      data-line={props.node && getStartLine(props.node)}
      data-endline={props.node && getEndLine(props.node)}
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
  return (
    <Tr data-line={props.node && getStartLine(props.node)}>{props.children}</Tr>
  )
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
      data-line={props.node && getStartLine(props.node)}
      data-endline={props.node && getEndLine(props.node)}
      boxSizing="border-box"
      padding={2}
      backgroundColor={useColorModeValue('#CCCCCC22')}
      overflow="auto"
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
      data-line={props.node && getStartLine(props.node)}
      data-endline={props.node && getEndLine(props.node)}
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

export function RemarkHr(props) {
  return (
    <Divider
      marginY="1em"
      borderBottomWidth="2px"
      data-line={props.node && getStartLine(props.node)}
    />
  )
}
