import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import { ChakraProvider } from '@chakra-ui/react'
import theme from './components/my_theme.jsx'
import './css/index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
)
