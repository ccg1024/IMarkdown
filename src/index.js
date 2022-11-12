import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'
import { ChakraProvider } from '@chakra-ui/react'
import './css/index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider>
    <App />
  </ChakraProvider>
);

