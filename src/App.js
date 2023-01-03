import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@chakra-ui/react'
import Editor from './editor.jsx'
import Preview from './preview.jsx';
import { SimpleGrid } from '@chakra-ui/react'
import { toggleView } from './utils/after_load.jsx'
import './css/App.css';

const fs = window.electronAPI.require('fs')

const App = () => {

  const [doc, setDoc] = useState('# In development...')
  const [filePath, setFilePath] = useState('')

  const handleDocChange = useCallback(newDoc => {
    setDoc(newDoc)
  }, [])

  useEffect(() => {
    window.electronAPI.openFile(async (_event, value) => {
      console.log("App.js got new file path: " + value)
      fs.readFile(value, 'utf-8', (err, data) => {
        if (err) throw err
        else {
          setDoc(data)
          setFilePath(value)
        }
      })
    })
    window.electronAPI.toggleView(toggleView)
  }, [])

  const handleScrollFirst = (scroll) => {
    const pre_doc = document.getElementById('preview-scroll')
    let currentPercent = (scroll.target.scrollTop) / (scroll.target.scrollHeight - scroll.target.clientHeight)
    pre_doc.scrollTop = (pre_doc.scrollHeight - pre_doc.clientHeight) * currentPercent
  }

  return (
    <>
      <SimpleGrid columns={2} height="100%" id='content_root'>
        <Box
          overflow='auto'
          height='100%'
          onScrollCapture={handleScrollFirst}
          id='editor_Box'
        >
          <Editor initialDoc={doc} onChange={handleDocChange} filePath={filePath} />
        </Box>

        <Box
          id='preview-scroll'
          className='preview_parent'
          overflow='auto'
          height='100%'
        >
          <Preview doc={doc} />
        </Box>
      </SimpleGrid>
    </>
  )
}

export default App
