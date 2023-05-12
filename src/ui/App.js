import PubSub from 'pubsub-js'
import { Flex } from '@chakra-ui/react'
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect
} from 'react'
import { useDispatch } from 'react-redux'

import Editor from './tsx/editor'
import Preview from './preview'
import FileDir from './components/file-dir'
import PubSubConfig from '../config/frontend'
import { getScrollLine } from './libs/tools'

import { modifyContent } from './app/reducers/fileContentSlice'

import NewPreview from './tsx/preview'

const path = window.electronAPI.require('path')

const App = () => {
  const [isChange, setIsChange] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showEditor, setShowEditor] = useState(true)
  const [recentFiles, setRecentFiles] = useState({})
  const [isLivePre, setIsLivePre] = useState(false)

  const dispatch = useDispatch()

  const scrollRef = useRef({
    previewScrollTo: 1,
    previewScrollTop: 1,
    editorScrollTo: 1
  })
  const pathRef = useRef('')

  // when file saved, invoked from editor
  const handleFileSave = useCallback(() => {
    setIsChange(false)
    setRecentFiles(v => ({
      ...v,
      [pathRef.current]: {
        ...v[pathRef.current],
        isChange: false
      }
    }))
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
  }, [])
  // update opened path from editor when save a empty path file
  const handleOpenedPath = useCallback(path => {
    pathRef.current = path
  }, [])
  // update recent file from editor when save a empty path file
  const handleRecentFiles = useCallback(fullpath => {
    setRecentFiles(v => ({
      ...v,
      [fullpath]: { filename: path.basename(fullpath), isChange: false }
    }))
  }, [])

  const toggleView = (_event, value) => {
    switch (value) {
      case 1: // show preview
        setShowEditor(false)
        setShowPreview(true)
        setIsLivePre(false)
        break
      case 2: // show editor
        const editorScrollLine = getScrollLine(
          scrollRef.current.previewScrollTop
        )
        scrollRef.current.editorScrollTo = editorScrollLine
        scrollRef.current.previewScrollTo = editorScrollLine
        setShowEditor(true)
        setShowPreview(false)
        setIsLivePre(false)
        break
      case 3:
        setShowEditor(true)
        setShowPreview(false)
        setIsLivePre(true)
        break
    }
  }

  useEffect(() => {
    window.electronAPI.initialedRender().then(result => {
      if (result) {
        const initialFile = JSON.parse(result)
        pathRef.current = initialFile.fullpath
        dispatch(modifyContent(initialFile.fileContent))
        setRecentFiles(v => ({
          ...v,
          [initialFile.fullpath]: {
            filename: initialFile.basename,
            isChange: initialFile.isChange
          }
        }))
        PubSub.publish(
          PubSubConfig.reCreateStateChannel,
          initialFile.fileContent
        )
      } else {
        PubSub.publish(PubSubConfig.reCreateStateChannel, '')
      }
    })
  }, [])

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

    dispatch(modifyContent(fileContent))
    setRecentFiles(v => ({ ...v, [fullPath]: { filename, isChange } }))
    setIsChange(isChange)
    setShowEditor(true)
    setShowPreview(false)

    PubSub.publish(PubSubConfig.reCreateStateChannel, fileContent)
    PubSub.publish(PubSubConfig.statusLineModify, isChange)
  }

  // setting config
  useLayoutEffect(() => {
    window.electronAPI.getConfigPath().then(configJson => {
      try {
        const settings = JSON.parse(configJson)
        const editor = document.querySelector('#editor_Box')
        const preview = document.querySelector('#preview-scroll')
        const live = document.querySelector('#live-preview')

        for (const name in settings) {
          switch (name) {
            case 'fontSize':
              editor.style.fontSize = settings[name]
              preview.style.fontSize = settings[name]
              live.style.fontSize = settings[name]
              break
            case 'editorFontFamily':
              editor.style.fontFamily = settings[name]
              break
            case 'previewFontFamily':
              preview.style.fontFamily = settings[name]
              live.style.fontFamily = settings[name]
              break
          }
        }
      } catch (e) {
        console.log(e)
      }
    })
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
          isChangeCallback={handleIsChange}
          isVisible={showEditor}
          scrollLine={scrollRef.current}
          openedPathCallback={handleOpenedPath}
          recentFilesCallback={handleRecentFiles}
          recentFiles={recentFiles}
          fileSaveCallback={handleFileSave}
        />
        <Preview isVisible={showPreview} scrollLine={scrollRef.current} />
        <NewPreview isVisible={isLivePre} />
      </Flex>
    </>
  )
}

export default App
