import React, { useEffect } from "react";
import ReactMarkdown from 'react-markdown'
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from 'rehype-raw'
import {
  Quote,
  MarkdownTd,
  MarkdownTh,
  MarkdownTr,
  MarkdownLink,
  MarkdownOList,
  MarkdownTable,
  MarkdownTbody,
  MarkdownThead,
  MarkdownUList,
  MarkdownListItem,
  MarkdownCode,
} from './components/markdown_tag.jsx'
import 'katex/dist/katex.min.css'
import './css/preview.css'
import { Image, Text } from '@chakra-ui/react'
import { previewScroll } from "./editor.jsx"


const Preview = ({ doc, currentFile }) => {

  const path = window.electronAPI.require('path')

  // run once after render
  useEffect(() => {
    let tempIdx = previewScroll;
    let target = document.querySelector("[data-sourcepos^='" + tempIdx + ":']");
    while (target === null && tempIdx > 1) {
      tempIdx -= 1
      target = document.querySelector("[data-sourcepos^='" + tempIdx + ":']")
    }
    if (target !== null) {
      target.scrollIntoView();
    }
  }, [])

  return (
    <ReactMarkdown
      className="preview"
      children={doc + "\n\n</br></br></br>"}
      components={{
        blockquote: Quote,
        a: MarkdownLink,
        ul: MarkdownUList,
        ol: MarkdownOList,
        li: MarkdownListItem,
        p: ({ node, ...props }) => { return <Text {...props} /> },
        img: ({ node, src, ...props }) => {
          if (src.startsWith(".")) {
            let nameLen = path.basename(currentFile).length
            let pathPre = currentFile.substring(0, currentFile.length - nameLen)
            src = pathPre + src
          }
          return <Image src={'atom:///' + src} {...props} borderRadius="md" boxShadow="lg" m="auto" />
        },
        table: MarkdownTable,
        thead: MarkdownThead,
        tbody: MarkdownTbody,
        tr: MarkdownTr,
        td: MarkdownTd,
        th: MarkdownTh,
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              children={String(children).replace(/\n$/, '')}
              style={docco}
              language={match[1]}
              showLineNumbers='true'
              PreTag="div"
              customStyle={{ marginTop: '10px', marginBottom: '10px', borderRadius: '5px' }}
              {...props}
            />
          ) : (
            <MarkdownCode className={className} {...props}>
              {children}
            </MarkdownCode>
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
