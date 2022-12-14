import React from "react";
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
  MarkdownText,
  MarkdownImage,
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


const Preview = ({ doc }) => {
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
        p: MarkdownText,
        img: MarkdownImage,
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
    />
  )
}


export default Preview
