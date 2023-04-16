import PubSub from 'pubsub-js'
import { Flex } from '@chakra-ui/react'
import React, { useState, useCallback, useEffect, useRef } from 'react'

import Editor from './editor'
import Preview from './preview'
import FileDir from './components/file-dir'
import PubSubConfig from '../config/frontend'
import { getScrollLine } from './libs/tools'

const App = () => {
  const [isChange, setIsChange] = useState(false)

  const [showPreview, setShowPreview] = useState(false)
  const [showEditor, setShowEditor] = useState(true)
  const [editorScroll, setEditorScroll] = useState(null)
  const [doc, setDoc] = useState('# In development')
  const [openedPath, setOpenedPath] = useState('')
  const [recentFiles, setRecentFiles] = useState({})
  const focusedFile = useRef(null)

  const handleDocChange = useCallback(newDoc => {
    setDoc(newDoc)
  }, [])

  const handleIsChange = useCallback(flag => {
    setIsChange(flag)
    console.log('into change')
  })

  const toggleView = (_event, value) => {
    switch (value) {
      case 1: // show preview
        setShowEditor(false)
        setShowPreview(true)
        break
      case 2: // show editor
        const editorScrollLine = getScrollLine()
        setShowEditor(true)
        setShowPreview(false)
        setEditorScroll(editorScrollLine)
        break
    }
  }

  useEffect(() => {
    window.electronAPI.setContentChange(isChange)
  }, [isChange])

  useEffect(() => {
    console.log('[App.js] run IPC serve for open file, toggleView')
    window.electronAPI.openFile(handleOpenFile)
    window.electronAPI.toggleView(toggleView)
    return () => {
      window.electronAPI.removeOpenFile()
      window.electronAPI.removeToggleView()
      console.log('[return App.js] drop listener in app.js')
    }
  }, [])

  function handleOpenFile(_event, fullPath, fileContent, filename) {
    setDoc(fileContent)
    setOpenedPath(fullPath)
    setRecentFiles(v => ({ ...v, [fullPath]: filename }))
    setIsChange(false)
    setShowEditor(true)
    setShowPreview(false)
    setEditorScroll(null)
    focusedFile.current = fullPath

    window.electronAPI.setFilePath(fullPath)

    PubSub.publish(PubSubConfig.reCreateStateChannel, 1)
  }

  // setting config
  useEffect(() => {
    window.electronAPI.getConfigPath().then(configJson => {
      try {
        const settings = JSON.parse(configJson)
        const editor = document.querySelector('#editor_Box')
        const preview = document.querySelector('#preview-scroll')

        for (const name in settings) {
          switch (name) {
            case 'fontSize':
              editor.style.fontSize = settings[name]
              preview.style.fontSize = settings[name]
              break
            case 'editorFontFamily':
              editor.style.fontFamily = settings[name]
              break
            case 'previewFontFamily':
              preview.style.fontFamily = settings[name]
              break
          }
        }
      } catch (e) {
        console.log(e)
      }
    })
  }, [])

  useEffect(() => {
    let token = PubSub.subscribe(PubSubConfig.fileSaved, (_msg, _data) => {
      setIsChange(false)
    })

    return () => {
      PubSub.unsubscribe(token)
    }
  }, [])

  // console.log(recentFiles)
  console.log(Object.keys(recentFiles))
  return (
    <>
      <Flex height="100%" width="100%" id="content_root">
        <FileDir
          recentFiles={recentFiles}
          currentFile={focusedFile.current}
          isChange={isChange}
        />
        <Editor
          initialDoc={doc}
          onChange={handleDocChange}
          isChangeCallback={handleIsChange}
          isVisible={showEditor}
          scrollLine={editorScroll}
        />
        <Preview doc={doc} openedPath={openedPath} isVisible={showPreview} />
      </Flex>
    </>
  )
}

export default App
