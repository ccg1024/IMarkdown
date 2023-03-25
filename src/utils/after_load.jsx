import React from 'react'
import ReactDOM from 'react-dom/client'
import Preview from '../preview.jsx'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '../components/my_theme.jsx'
import { doc, currentFile } from '../App.js'
import { previewScrollTop } from '../preview.jsx'

let root = null

export let editorScrollPos = 1

export const toggleView = async (_event, value) => {
  if (value === 1) {
    // just show preview part
    const t1 = document.getElementById('editor_Box')
    const t2 = document.getElementById('preview-scroll')

    t1.style.display = 'none'
    t2.style.display = 'block'

    // load react component
    if (root === null) {
      root = ReactDOM.createRoot(document.getElementById('preview-scroll'))
      root.render(
        <ChakraProvider theme={theme}>
          <Preview doc={doc} currentFile={currentFile} />
        </ChakraProvider>
      )
    }
  } else if (value === 2) {
    // just show editor part
    const t1 = document.getElementById('editor_Box')
    const t2 = document.getElementById('preview-scroll')

    // get element position
    const previewBox = t2.children
    if (previewBox.length > 0) {
      const previewBody = previewBox[0].children
      const gap = previewBody[0].offsetTop - 1
      let earlyStop = false
      for (let i = 0; i < previewBody.length - 1; i++) {
        if (previewScrollTop - previewBody[i].offsetTop + gap <= 0) {
          // find item
          // console.log(previewScrollTop);
          // console.log('find item, ', previewBody[i]);
          const item = i > 0 ? previewBody[i - 1] : previewBody[0]
          // console.log('find item, ', item);
          if (item.hasAttribute('data-sourcepos')) {
            let posString = item.getAttribute('data-sourcepos')
            // console.log(posString);
            // console.log(/^(.*?):.+$/.exec(posString)[1]);
            editorScrollPos = /^(.*?):.+$/.exec(posString)[1]
            // console.log('editorScrollPos set to ', editorScrollPos)
            earlyStop = true
          }
          break
        }
      }
      // go down
      if (!earlyStop) {
        let posString =
          previewBody[previewBody.length - 2].getAttribute('data-sourcepos')
        editorScrollPos = /^(.*?):.+$/.exec(posString)[1]
        // console.log('out of for loop, and editorScrollPos set to ', editorScrollPos)
      }
    }

    t1.style.display = 'block'
    t2.style.display = 'none'

    // remove react component
    if (root !== null) {
      root.unmount()
      root = null
    }
  }
}
