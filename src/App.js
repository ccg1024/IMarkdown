import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react'
import Editor from './editor.jsx'
import { toggleView } from './utils/after_load.jsx'
import FileDir from './components/file_dir.jsx';
import './css/App.css';

const fs = window.electronAPI.require('fs')

export let doc = "# In development";
export let currentFile = "";

const App = () => {

  const [filePath, setFilePath] = useState('')
  const recentFiles = useRef([])

  const handleDocChange = useCallback(newDoc => {
    doc = newDoc
  }, [])
  const handlePathChange = useCallback(newPath => {
    setFilePath(newPath)
    currentFile = newPath;
  })

  useEffect(() => {
    window.electronAPI.openFile(async (_event, value) => {
      console.log("App.js got new file path: " + value)
      fs.readFile(value, 'utf-8', (err, data) => {
        if (err) throw err
        else {
          toggleView('from open file', 2);
          doc = data;
          setFilePath(value)
          currentFile = value;
          if (!recentFiles.current.includes(value)) {
            recentFiles.current = [...recentFiles.current, value]
          }
        }
      })
    })
    window.electronAPI.toggleView(toggleView)
  }, [])

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
          id='editor_Box'
          w='80%'
          style={{ display: "block" }}
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
        </Box>
      </Flex>
    </>
  )
}

export default App
