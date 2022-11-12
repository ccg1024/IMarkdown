import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '@chakra-ui/react'
import Editor from './editor.jsx'
import Preview from './preview.jsx';
import { SimpleGrid } from '@chakra-ui/react'
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
  }, [])

  const handleScrollFirst = (scroll) => {
    const pre_doc = document.getElementById('preview-scroll')
    let currentPercent = (scroll.target.scrollTop + scroll.target.clientHeight) / scroll.target.scrollHeight
    pre_doc.scrollTop = pre_doc.scrollHeight * currentPercent - pre_doc.clientHeight
  }

  return (
    <>
      <SimpleGrid columns={2} height="100%">
        <Box
          overflow='auto'
          height='100%'
          onScrollCapture={handleScrollFirst}
        >
          <Editor initialDoc={doc} onChange={handleDocChange} filePath={filePath} />
        </Box>

        <Box
          id='preview-scroll'
          className='preview_parent'
          overflow='auto'
          backgroundColor='#000000'
          height='100%'
        >
          <Preview doc={doc} />
        </Box>
      </SimpleGrid>
    </>
  )
}

export default App
