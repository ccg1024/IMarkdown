import ReactDOM from 'react-dom/client'
import React, { StrictMode } from 'react'
import { ChakraProvider } from '@chakra-ui/react'

import './libs/shim'
import App from './App.js'
import theme from './libs/base-theme'

import '../static/css/index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ChakraProvider theme={theme}>
    <StrictMode>
      <App />
    </StrictMode>
  </ChakraProvider>
)
