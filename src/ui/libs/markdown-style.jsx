import React from 'react'
import { Global } from '@emotion/react'

const MarkdownStyle = () => {
  return (
    <Global
      styles={{
        '.preview': {
          padding: '12px',
          textAlign: 'justify',
          fontSize: '1em'
        },
        '.preview h1': {
          fontSize: '2em',
          margin: '8px 0',
          fontWeight: 'bold',
          borderBottom: '2px solid'
        },
        '.preview h2': {
          fontSize: '1.8em',
          margin: '6px 0',
          fontWeight: 'bold',
          borderBottom: '2px dashed'
        },
        '.preview h3': {
          fontSize: '1.6em',
          margin: '4px 0',
          fontWeight: 'bold'
        },
        '.preview h4': {
          fontSize: '1.4em',
          margin: '4px 0',
          fontWeight: 'bold'
        },
        '.preview h5': {
          fontSize: '1.2em',
          margin: '4px 0',
          fontWeight: 'bold'
        },
        '.preview h6': {
          fontSize: '1em',
          margin: '4px 0',
          fontWeight: 'bold'
        },
        '.preview p': {
          margin: '10px 0'
        },
        '.preview ul': {
          margin: '10px 0'
        },
        '.katex-mathml': {
          display: 'none'
        }
      }}
    />
  )
}

export default MarkdownStyle
