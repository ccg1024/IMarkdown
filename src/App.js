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
    window.electronAPI.toggleView(async (_event, value) => {
      if (value === 1) {  // just show preview part
        const t0 = document.getElementById("content_root")
        const t1 = document.getElementById("editor_Box")
        const t2 = document.getElementById("preview-scroll")

        t0.style.display = 'block'
        t1.style.display = 'none'
        t2.style.display = 'block'
        t2.style.width = "70%"
        t2.style.margin = "auto"

        document.getElementById("root").style.backgroundColor = "#000000"
      } else if (value === 2) {  // just show editor part
        const t0 = document.getElementById("content_root")
        const t1 = document.getElementById("editor_Box")
        const t2 = document.getElementById("preview-scroll")

        t0.style.display = 'block'
        t1.style.display = 'block'
        t1.style.width = "70%"
        t1.style.margin = "auto"
        t2.style.display = 'none'

        document.getElementById("root").style.backgroundColor = "#282c34"
      } else if (value === 0) {  // show normal view, left editor, right preview
        const t0 = document.getElementById("content_root")
        const t1 = document.getElementById("editor_Box")
        const t2 = document.getElementById("preview-scroll")

        t0.style.display = 'grid'
        t1.style.display = 'block'
        t1.style.width = "100%"
        t1.style.margin = "0"
        t2.style.display = 'block'
        t2.style.width = "100%"
        t2.style.margin = '0'
      }
    })
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
