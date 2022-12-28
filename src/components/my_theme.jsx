import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const styles = {
  global: props => ({
    body: {
      bg: mode('transparent', 'transparent')(props),
      color: mode('black', 'white')(props)
    }
  })
}

const components = {
  Link: {
    baseStyle: props => ({
      color: mode('#3d7aed', '#ff63c3')(props),
      textUnderLineOffset: 3
    })
  },
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


// const theme = extendTheme({
//   styles: {
//     global: {
//       body: {
//         bg: 'transparent',
//         color: 'white'
//       }
//     },
//   },
// })

const theme = extendTheme({ config, styles, components, fonts, colors })
export default theme
