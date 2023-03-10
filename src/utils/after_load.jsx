import React from 'react';
import ReactDOM from 'react-dom/client';
import Preview from '../preview.jsx';
import { ChakraProvider } from '@chakra-ui/react'
import theme from '../components/my_theme.jsx';
import { doc, currentFile } from '../App.js'

let root = null;

export const toggleView = async (_event, value) => {
  if (value === 1) {  // just show preview part
    const t1 = document.getElementById("editor_Box")
    const t2 = document.getElementById("preview-scroll")

    t1.style.display = 'none'
    t2.style.display = 'block'

    // load react component
    if (root === null) {
      root = ReactDOM.createRoot(document.getElementById('preview-scroll'));
      root.render(
        <ChakraProvider theme={theme}>
          <Preview doc={doc} currentFile={currentFile} />
        </ChakraProvider>
      );
    }
  } else if (value === 2) {  // just show editor part
    const t1 = document.getElementById("editor_Box")
    const t2 = document.getElementById("preview-scroll")

    t1.style.display = 'block'
    t2.style.display = 'none'

    // remove react component
    if (root !== null) {
      root.unmount();
      root = null;
    }
  }
}
