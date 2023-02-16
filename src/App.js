import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react'
import Editor from './editor.jsx'
import Preview from './preview.jsx';
import { toggleView } from './utils/after_load.jsx'
import FileDir from './components/file_dir.jsx';
import './css/App.css';

const fs = window.electronAPI.require('fs')

const App = () => {

  const [doc, setDoc] = useState('# In development...')
  const [filePath, setFilePath] = useState('')
  const recentFiles = useRef([])

  const handleDocChange = useCallback(newDoc => {
    setDoc(newDoc)
  }, [])
  const handlePathChange = useCallback(newPath => {
    setFilePath(newPath)
  })

  useEffect(() => {
    window.electronAPI.openFile(async (_event, value) => {
      console.log("App.js got new file path: " + value)
      fs.readFile(value, 'utf-8', (err, data) => {
        if (err) throw err
        else {
          setDoc(data)
          setFilePath(value)
          if (!recentFiles.current.includes(value)) {
            recentFiles.current = [...recentFiles.current, value]
          }
        }
      })
    })
    window.electronAPI.toggleView(toggleView)
  }, [])

  const handleScrollFirst = (scroll) => {
    let currentPercent = (scroll.target.scrollTop) / (scroll.target.scrollHeight - scroll.target.clientHeight)
    if (currentPercent > 0.95) {
      const pre_doc = document.getElementById('preview-scroll')
      pre_doc.scrollTop = (pre_doc.scrollHeight - pre_doc.clientHeight) * currentPercent
    }
  }

  return (
    <>
      <Flex height="100%" width="100%" id='content_root'>
        <FileDir
          recentFiles={recentFiles.current}
          currentFile={filePath}
          handlePath={handlePathChange}
          handleDoc={handleDocChange}
        />
        <Box
          overflow='auto'
          height='100%'
          onScrollCapture={handleScrollFirst}
          id='editor_Box'
          w='80%'
        >
          <Editor initialDoc={doc} onChange={handleDocChange} filePath={filePath} />
        </Box>

        <Box
          id='preview-scroll'
          className='preview_parent'
          overflow='auto'
          height='100%'
          w="80%"
          pl={2}
        >
          <Preview doc={doc} currentFile={filePath} />
        </Box>
      </Flex>
    </>
  )
}

export default App
