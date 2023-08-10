import { mode } from '@chakra-ui/theme-tools'
import { extendTheme } from '@chakra-ui/react'

const styles = {
  global: (props: any) => ({
    body: {
      bg: mode('#ffffff', 'RGBA(0, 0, 0, 0.08)')(props),
      color: mode('black', 'white')(props)
    }
  })
}

const components = {
  Link: {
    baseStyle: (props: any) => ({
      color: mode('#3d7aed', '#ff63c3')(props),
      textUnderLineOffset: 3
    })
  }
}

const fonts = {
  heading: "'M PLUS Rounded 1c'"
}

const colors = {
  grassTeal: '#88ccca'
}

const config = {
  // initialColorMode: 'dark',
  useSystemColorMode: true
}

const theme = extendTheme({ config, styles, components, fonts, colors })
export default theme
