import React from 'react'
import { Global } from '@emotion/react'

const MarkdownStyle: React.FC = () => (
  <Global
    styles={{
      '.preview': {
        padding: '12px',
        textAlign: 'justify',
        fontSize: '1em'
      },
      '.preview h1 h2 h3 h4 h5 h6': {
        fontWeight: 'bold',
        textDecoration: 'underline',
        textDecorationThickness: '4px',
        textUnderlineOffset: '8px',
        textDecorationColor: '#A0AEC0'
      },
      '.preview h1': {
        fontSize: '2em',
        marginTop: '0.5em',
        marginBottom: '1em'
      },
      '.preview h2': {
        fontSize: '1.8em',
        marginTop: '0.5em',
        marginBottom: '1em'
      },
      '.preview h3': {
        fontSize: '1.6em',
        marginTop: '0.5em',
        marginBottom: '1em'
      },
      '.preview h4': {
        fontSize: '1.4em',
        marginTop: '0.5em',
        marginBottom: '1em'
      },
      '.preview h5': {
        fontSize: '1.2em',
        marginTop: '0.5em',
        marginBottom: '1em'
      },
      '.preview h6': {
        fontSize: '1em',
        marginTop: '0.5em',
        marginBottom: '1em'
      },
      '.preview p': {
        margin: '1em 0'
      }
    }}
  />
)

export default MarkdownStyle
