import React, { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import './css/preview.css'
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
import { previewScroll } from './editor.jsx'
import _ from 'lodash'

export let previewScrollTop = 1

const Preview = ({ doc, currentFile }) => {
  const path = window.electronAPI.require('path')

  // run once after render
  useEffect(() => {
    let tempIdx = previewScroll
    let target = document.querySelector("[data-sourcepos^='" + tempIdx + ":']")
    while (target === null && tempIdx > 1) {
      tempIdx -= 1
      target = document.querySelector("[data-sourcepos^='" + tempIdx + ":']")
    }
    if (target !== null) {
      target.scrollIntoView()
    }

    if (previewScroll === 1) {
      previewScrollTop = 1
    }

    // set scroll listener
    const previewBody = document.querySelector('#preview-scroll')
    previewBody.onscroll = _.throttle(event => {
      previewScrollTop = event.target.scrollTop
    }, 500)
  }, [])

  return (
    <ReactMarkdown
      className="preview"
      children={doc + '\n\n</br></br></br>'}
      components={{
        blockquote: ({ node, ...props }) => {
          return (
            <Box
              borderRadius="5px"
              bg={useColorModeValue('whiteAlpha.500', 'blackAlpha.500')}
              pl={2}
              pr={2}
              mt={2}
              mb={2}
              pt="1px"
              pb="1px"
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
          return <OrderedList p={0} marginInlineStart="2em" {...props} />
        },
        li: ({ node, ...props }) => {
          props.ordered = props.ordered.toString()
          return <ListItem textAlign="justify" {...props} />
        },
        p: ({ node, ...props }) => {
          return <Text {...props} />
        },
        img: ({ node, src, ...props }) => {
          if (src.startsWith('.')) {
            let nameLen = path.basename(currentFile).length
            let pathPre = currentFile.substring(0, currentFile.length - nameLen)
            src = pathPre + src
          }
          return (
            <Image
              src={'atom:///' + src}
              {...props}
              borderRadius="md"
              boxShadow="lg"
              m="auto"
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
              children={String(children).replace(/\n$/, '')}
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
            />
          ) : (
            <Code
              fontWeight="bold"
              color={useColorModeValue('#3D7AED', '#FF63C3')}
              className={className}
              fontSize="1em"
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
    />
  )
}

export default Preview
