import ReactDOM from 'react-dom/client'
import React, { StrictMode } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux'

import './libs/shim'
import App from './App.js'
import theme from './libs/base-theme'

import store from './app/store'

import '../static/css/index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <ChakraProvider theme={theme}>
      <StrictMode>
        <App />
      </StrictMode>
    </ChakraProvider>
  </Provider>
)
