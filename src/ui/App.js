import PubSub from 'pubsub-js'
import { Flex } from '@chakra-ui/react'
import React, { useState, useRef, useCallback, useEffect } from 'react'

import Editor from './editor'
import Preview from './preview'
import FileDir from './components/file-dir'
import PubSubConfig from '../config/frontend'
import { getScrollLine } from './libs/tools'

const path = window.electronAPI.require('path')

const App = () => {
  const [isChange, setIsChange] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showEditor, setShowEditor] = useState(true)
  const [doc, setDoc] = useState('# In development')
  const [recentFiles, setRecentFiles] = useState({})

  const scrollRef = useRef({
    previewScrollTo: 1,
    previewScrollTop: 1,
    editorScrollTo: 1
  })
  const pathRef = useRef('')

  // update doc from editor
  const handleDocChange = useCallback(newDoc => {
    setDoc(newDoc)
    if (pathRef.current) {
      window.electronAPI.updateCache(
        JSON.stringify({
          filePath: pathRef.current,
          fileContent: newDoc
        })
      )
    }
  }, [])

  // update isChange flag from editor
  const handleIsChange = useCallback(flag => {
    setIsChange(flag)
    if (pathRef.current) {
      setRecentFiles(v => ({
        ...v,
        [pathRef.current]: {
          ...v[pathRef.current],
          isChange: flag
        }
      }))
    }
  })

  // update opened path from editor when save a empty path file
  const handleOpenedPath = useCallback(path => {
    pathRef.current = path
  })
  // update recent file from editor when save a empty path file
  const handleRecentFiles = useCallback(fullpath => {
    setRecentFiles(v => ({
      ...v,
      [fullpath]: { filename: path.basename(fullpath), isChange: false }
    }))
  })

  const toggleView = (_event, value) => {
    switch (value) {
      case 1: // show preview
        setShowEditor(false)
        setShowPreview(true)
        break
      case 2: // show editor
        const editorScrollLine = getScrollLine(
          scrollRef.current.previewScrollTop
        )
        setShowEditor(true)
        setShowPreview(false)
        scrollRef.current.editorScrollTo = editorScrollLine
        break
    }
  }

  useEffect(() => {
    if (pathRef.current) {
      window.electronAPI.setContentChange(isChange, pathRef.current)
    }
  }, [isChange])

  useEffect(() => {
    window.electronAPI.openFile(handleOpenFile)
    window.electronAPI.toggleView(toggleView)
    return () => {
      window.electronAPI.removeOpenFile()
      window.electronAPI.removeToggleView()
    }
  }, [])

  function handleOpenFile(_event, fullPath, fileContent, filename, isChange) {
    scrollRef.current.editorScrollTo = 1
    pathRef.current = fullPath

    setDoc(fileContent)
    setRecentFiles(v => ({ ...v, [fullPath]: { filename, isChange } }))
    setIsChange(isChange)
    setShowEditor(true)
    setShowPreview(false)

    window.electronAPI.setFilePath(fullPath)

    PubSub.publish(PubSubConfig.reCreateStateChannel, 1)
    PubSub.publish(PubSubConfig.statusLineModify, isChange)
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
      setRecentFiles(v => ({
        ...v,
        [pathRef.current]: {
          ...v[pathRef.current],
          isChange: false
        }
      }))
    })

    return () => {
      PubSub.unsubscribe(token)
    }
  }, [])

  return (
    <>
      <Flex height="100%" width="100%" id="content_root">
        <FileDir
          recentFiles={recentFiles}
          currentFile={pathRef.current}
          isChange={isChange}
        />
        <Editor
          initialDoc={doc}
          onChange={handleDocChange}
          isChangeCallback={handleIsChange}
          isVisible={showEditor}
          scrollLine={scrollRef.current}
          openedPathCallback={handleOpenedPath}
          recentFilesCallback={handleRecentFiles}
          recentFiles={recentFiles}
        />
        <Preview
          doc={doc}
          openedPath={pathRef.current}
          isVisible={showPreview}
          scrollLine={scrollRef.current}
        />
      </Flex>
    </>
  )
}

export default App
