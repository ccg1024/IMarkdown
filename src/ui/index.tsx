import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import App from './App'
import store from './app/store'
import theme from './libs/global'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ChakraProvider theme={theme}>
    <Provider store={store}>
      <StrictMode>
        <HashRouter>
          <App />
        </HashRouter>
      </StrictMode>
    </Provider>
  </ChakraProvider>
)
