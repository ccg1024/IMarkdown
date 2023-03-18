import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react'
import Editor from './editor.jsx'
import { toggleView } from './utils/after_load.jsx'
import FileDir from './components/file_dir.jsx';
import './css/App.css';

const fs = window.electronAPI.require('fs')
const path = window.electronAPI.require('path')
export let doc = "# In development";
export let currentFile = "";

// convert path
export const converWin32Path = (filePath) => filePath.split(path.sep).join(path.posix.sep);

const App = () => {

  const [filePath, setFilePath] = useState('')
  const [isChange, setIsChange] = useState(false);
  const [tempPath, setTempPath] = useState('');
  const recentFiles = useRef([])

  const handleIsChange = useCallback(newFlag => {
    setIsChange(newFlag);
    // console.log('into is change callback');
  }, []);
  const handleDocChange = useCallback(newDoc => {
    doc = newDoc
    setIsChange(true);
    // console.log('the doc is change');
  }, [])
  const handlePathChange = useCallback(newPath => {
    setTempPath(newPath)
    // currentFile = newPath;
  }, [])

  useEffect(() => {
    if (tempPath) {
      console.log('App useEffect set file content activated for: ' + tempPath);
      fs.readFile(tempPath, 'utf-8', (err, data) => {
        if (err) {
          throw err;
        } else {
          toggleView('from open file', 2);
          doc = data;
          currentFile = tempPath;

          const converPath = converWin32Path(tempPath);

          if (!recentFiles.current.includes(converPath)) {
            recentFiles.current = [...recentFiles.current, converPath];
          }

          // activte the editor useEffect to update codemirror
          setFilePath(tempPath);
        }
      });
    }
  }, [tempPath]);

  useEffect(() => {
    window.electronAPI.openFile(async (_event, value) => {
      console.log("IPC App.js got new file, set temp path: " + value);
      setTempPath(value);
      setIsChange(false);

      // since open a new file, whatever the file is change, reset it
      window.electronAPI.setContentChange(false);
    })
    window.electronAPI.toggleView(toggleView)
  }, [])

  return (
    <>
      <Flex height="100%" width="100%" id='content_root'>
        <FileDir
          recentFiles={recentFiles.current}
          currentFile={filePath}
          isChange={isChange}
          handlePath={handlePathChange}
        />
        <Box
          overflow='auto'
          height='100%'
          id='editor_Box'
          w='100%'
          style={{ display: "block" }}
        >
          <Editor
            initialDoc={doc}
            onChange={handleDocChange}
            filePath={filePath}
            handleIsChange={handleIsChange}
          />
        </Box>

        <Box
          id='preview-scroll'
          className='preview_parent'
          overflow='auto'
          height='100%'
          w="100%"
          pl={2}
        >
        </Box>
      </Flex>
    </>
  )
}

export default App
