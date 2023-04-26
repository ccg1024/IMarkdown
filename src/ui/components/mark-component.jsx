import React from 'react'
import 'katex/dist/katex.min.css'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import ReactMarkdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/docco'
import {
  Box,
  Code,
  Image,
  Link,
  ListItem,
  OrderedList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList,
  useColorModeValue
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import MarkdownStyle from '../libs/markdown-style'

import { selectFileContent } from '../app/reducers/fileContentSlice'

const MarkComponent = () => {
  const colors = {
    blockquote: useColorModeValue('gray.100', 'whiteAlpha.200'),
    code: useColorModeValue('#3D7AED', '#FF63C3')
  }
  const doc = useSelector(selectFileContent)
  return (
    <>
      <MarkdownStyle />
      <ReactMarkdown
        className="preview"
        components={{
          blockquote: ({ node, ...props }) => {
            return (
              <Box
                overflow="auto"
                borderRadius="md"
                bg={colors.blockquote}
                padding="0.5em"
                marginY="1em"
                boxShadow="lg"
                {...props}
              />
            )
          },
          a: ({ node, ...props }) => {
            return <Link textAlign="justify" {...props} />
          },
          ul: ({ node, ...props }) => {
            props.ordered = 'false'
            return <UnorderedList p={0} {...props} />
          },
          ol: ({ node, ...props }) => {
            props.ordered = 'true'
            return <OrderedList p={0} {...props} />
          },
          li: ({ node, ...props }) => {
            props.ordered = props.ordered.toString()
            return <ListItem textAlign="justify" {...props} />
          },
          p: ({ node, ...props }) => {
            return <Text overflow="auto" {...props} />
          },
          img: ({ node, src, ...props }) => {
            return (
              <Image
                src={'atom://' + src}
                {...props}
                borderRadius="md"
                boxShadow="lg"
                m="auto"
                marginY="1em"
              />
            )
          },
          table: ({ node, ...props }) => {
            return (
              <TableContainer mb={2} mt={2} {...props}>
                <Table variant="simple" textAlign="left" {...props} />
              </TableContainer>
            )
          },
          thead: ({ node, ...props }) => {
            return <Thead {...props} />
          },
          tbody: ({ node, ...props }) => {
            return <Tbody {...props} />
          },
          tr: ({ node, ...props }) => {
            delete props.isHeader
            return <Tr {...props} />
          },
          td: ({ node, ...props }) => {
            delete props.isHeader
            return <Td {...props} />
          },
          th: ({ node, ...props }) => {
            delete props.isHeader
            return <Th fontSize="1em" {...props} />
          },
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={docco}
                language={match[1]}
                showLineNumbers="true"
                PreTag="div"
                customStyle={{
                  marginTop: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px'
                }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <Code
                fontWeight="bold"
                color={colors.code}
                className={className}
                fontSize="1em"
                backgroundColor="unset"
                {...props}
              >
                {children}
              </Code>
            )
          }
        }}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        sourcePos={true}
      >
        {doc}
      </ReactMarkdown>
    </>
  )
}

export default MarkComponent
