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
  Divider
} from '@chakra-ui/react'

function getStartLine(node: any) {
  return node.position.start.line
}
function getEndLine(node: any) {
  return node.position.end.line
}

export function RemarkText(props: any): JSX.Element {
  return (
    <Text marginY="1em" data-line={props.node && getStartLine(props.node)}>
      {props.children}
    </Text>
  )
}

export function RemarkHeading(props: any): JSX.Element {
  const tagName = props.node ? props.node.tagName : 'h1'
  return (
    <Heading
      as={tagName}
      fontSize={'1.' + (6 - tagName.replace('h', '')) + 'em'}
      fontFamily="inherit"
      marginY="1em"
      textDecoration="underline"
      textUnderlineOffset="8px"
      textDecorationThickness="4px"
      textDecorationColor={useColorModeValue('gray.200', 'gray.200')}
      data-line={props.node && getStartLine(props.node)}
    >
      {props.children}
    </Heading>
  )
}

export function RemarkQuote(props: any): JSX.Element {
  return (
    <Box
      overflow="auto"
      borderRadius="md"
      backgroundColor={useColorModeValue('gray.100', 'whiteAlpha.200')}
      padding="0.5em"
      marginY="1em"
      boxShadow="md"
      data-line={props.node && getStartLine(props.node)}
      data-endline={props.node && getEndLine(props.node)}
    >
      {props.children}
    </Box>
  )
}

export function RemarkLink(props: any): JSX.Element {
  return (
    <Link data-line={props.node && getStartLine(props.node)}>
      {props.children}
    </Link>
  )
}

export function RemarkUl(props: any): JSX.Element {
  return (
    <UnorderedList
      data-line={props.node && getStartLine(props.node)}
      data-endline={props.node && getEndLine(props.node)}
    >
      {props.children}
    </UnorderedList>
  )
}

export function RemarkOl(props: any): JSX.Element {
  return (
    <OrderedList
      data-line={props.node && getStartLine(props.node)}
      data-endline={props.node && getEndLine(props.node)}
    >
      {props.children}
    </OrderedList>
  )
}

export function RemarkLi(props: any): JSX.Element {
  return (
    <ListItem data-line={props.node && getStartLine(props.node)}>
      {props.children}
    </ListItem>
  )
}

export function RemarkImg(props: any): JSX.Element {
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

export function RemarkHr(props: any): JSX.Element {
  return (
    <Divider
      marginY="1em"
      borderBottomWidth="2px"
      data-line={props.node && getStartLine(props.node)}
    />
  )
}

export function RemarkTable(props: any): JSX.Element {
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

export function RemarkThead(props: any): JSX.Element {
  return <Thead>{props.children}</Thead>
}

export function RemarkTbody(props: any): JSX.Element {
  return <Tbody>{props.children}</Tbody>
}

export function RemarkTr(props: any): JSX.Element {
  return (
    <Tr data-line={props.node && getStartLine(props.node)}>{props.children}</Tr>
  )
}

export function RemarkTd(props: any): JSX.Element {
  return <Td>{props.children}</Td>
}

export function RemarkTh(props: any): JSX.Element {
  return <Th>{props.children}</Th>
}

export function RemarkCodePre(props: any): JSX.Element {
  return (
    <Box
      as="pre"
      data-line={props.node && getStartLine(props.node)}
      data-endline={props.node && getEndLine(props.node)}
      boxSizing="border-box"
      padding={2}
      backgroundColor={useColorModeValue('#CCCCCC22', '#CCCCCC22')}
      overflow="auto"
    >
      {props.children}
    </Box>
  )
}
