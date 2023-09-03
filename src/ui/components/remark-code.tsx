import React from 'react'
import { Code, useColorModeValue } from '@chakra-ui/react'

import { useRunmode } from '../hooks/useRunmode'

const RemarkCode: React.FC<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
> = props => {
  const { className } = props
  const langName = (className || '').substring(9)

  const spans = useRunmode(langName, props.children)

  if (spans.length > 0) {
    return (
      <code>
        {spans.map((span, i) => (
          <span key={i} className={span.style || ''}>
            {span.text}
          </span>
        ))}
      </code>
    )
  }

  return (
    <Code
      color={useColorModeValue('#3D7AED', '#FF63C3')}
      backgroundColor="unset"
      fontWeight="bold"
      fontFamily="inherit"
      fontSize="1em"
    >
      {props.children}
    </Code>
  )
}

export default RemarkCode
