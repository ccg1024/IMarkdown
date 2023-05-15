import PubSub from 'pubsub-js'
import { Flex, Box } from '@chakra-ui/react'
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
import PubSubConfig from '../config/frontend'
import { getScrollLine } from './libs/tools'
import GhostInfo from './tsx/components/ghost-info'

import { modifyContent } from './app/reducers/fileContentSlice'
import { modifyCurrentFile } from './app/reducers/currentFileSlice'
import { modifyRecentFiles } from './app/reducers/recentFilesSlice'

import NewPreview from './tsx/preview'
import MarkHeadInfo from './tsx/components/mark-head'
import SideBar from './tsx/components/side-bar'
import TitleBar from './tsx/components/title-bar'

import { formatedTime } from './tsx/libs/tools'

const App = () => {
  const [showPreview, setShowPreview] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [isLivePre, setIsLivePre] = useState(false)
  const [showHeadInfo, setShowHeadInfo] = useState(false)
  const uiControl = useRef(false)

  const dispatch = useCallback(useDispatch(), [])

  const scrollRef = useRef({
    previewScrollTo: 1,
    previewScrollTop: 1,
    editorScrollTo: 1
  })
  const sideBarRef = useRef(null)

  const handleFullScreen = useCallback(() => {
    const sideBar = sideBarRef.current
    if (sideBar) {
      if (sideBar.style.display === 'none') {
        sideBar.style.display = 'block'
      } else {
        sideBar.style.display = 'none'
      }
    }
  }, [])
  const handleLivePreview = useCallback(() => {
    setShowPreview(false)
    setShowEditor(true)
    setIsLivePre(v => !v)
  }, [])
  const handleJustPreview = useCallback(() => {
    setShowEditor(false)
    setShowPreview(true)
    setIsLivePre(false)
  }, [])
  const handleJustEditor = useCallback(() => {
    const editorScrollLine = getScrollLine(scrollRef.current.previewScrollTop)
    scrollRef.current.editorScrollTo = editorScrollLine
    scrollRef.current.previewScrollTo = editorScrollLine
    setShowEditor(true)
    setShowPreview(false)
    setIsLivePre(false)
  }, [])

  const toggleView = (_event, value) => {
    switch (value) {
      case 1: // show preview
        if (uiControl.current) {
          setShowEditor(false)
          setShowPreview(true)
          setIsLivePre(false)
        }
        break
      case 2: // show editor
        if (uiControl.current) {
          const editorScrollLine = getScrollLine(
            scrollRef.current.previewScrollTop
          )
          scrollRef.current.editorScrollTo = editorScrollLine
          scrollRef.current.previewScrollTo = editorScrollLine
          setShowEditor(true)
          setShowPreview(false)
          setIsLivePre(false)
        }
        break
      case 3:
        if (uiControl.current) {
          setShowEditor(true)
          setShowPreview(false)
          setIsLivePre(true)
        }
        break
      case 4:
        handleFullScreen()
        break
    }
  }

  useEffect(() => {
    window.electronAPI.initialedRender().then(result => {
      if (result) {
        const initialFile = JSON.parse(result)
        dispatch(modifyContent(initialFile.fileContent))
        dispatch(
          modifyRecentFiles({
            id: initialFile.fullpath,
            date: formatedTime(initialFile.headInfo.date),
            desc: initialFile.headInfo.desc,
            title: initialFile.headInfo.title
          })
        )
        dispatch(modifyCurrentFile(initialFile.fullpath))
        PubSub.publish(
          PubSubConfig.reCreateStateChannel,
          initialFile.fileContent
        )
        setShowEditor(true)
        setShowHeadInfo(true)
        uiControl.current = true
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

  function handleOpenFile(_event, fullPath, fileContent, headInfo, isChange) {
    scrollRef.current.editorScrollTo = 1

    dispatch(modifyContent(fileContent))
    dispatch(
      modifyRecentFiles({
        id: fullPath,
        date: formatedTime(headInfo.date),
        desc: headInfo.desc,
        title: headInfo.title
      })
    )
    dispatch(modifyCurrentFile(fullPath))
    setShowEditor(true)
    setShowPreview(false)
    setShowHeadInfo(true)
    if (!uiControl.current) {
      uiControl.current = true
    }

    PubSub.publish(PubSubConfig.reCreateStateChannel, fileContent)
    PubSub.publish(PubSubConfig.statusLineModify, isChange)
  }

  // setting config
  useLayoutEffect(() => {
    window.electronAPI.getConfigPath().then(configJson => {
      try {
        const settings = JSON.parse(configJson)
        const editor = document.querySelector('#editor_Box')
        // const preview = document.querySelector('#preview-scroll')
        // const live = document.querySelector('#live-preview')
        // const sideBar = document.querySelector('#side-bar')

        for (const name in settings) {
          switch (name) {
            case 'fontSize':
              document.querySelector('#content_root').style.fontSize =
                settings[name]
              break
            case 'editorFontFamily':
              editor.style.fontFamily = settings[name]
              break
            case 'previewFontFamily':
              document.querySelector('#content_root').style.fontFamily =
                settings[name]
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
        <Box ref={sideBarRef} width="35%" height="100%" flexShrink={0}>
          <SideBar />
        </Box>
        <Box
          display="flex"
          flexShrink={0}
          flexGrow={1}
          width="65%"
          height="100%"
          flexDirection="column"
          position="relative"
        >
          <TitleBar />
          {showHeadInfo ? (
            <MarkHeadInfo
              fullScreenCallback={handleFullScreen}
              livePreviewCallback={handleLivePreview}
              justPreviewCallback={handleJustPreview}
              justEditorCallback={handleJustEditor}
            />
          ) : (
            <GhostInfo />
          )}
          <Flex height="100%" width="100%" overflow="auto">
            <Editor isVisible={showEditor} scrollLine={scrollRef.current} />
            <Preview isVisible={showPreview} scrollLine={scrollRef.current} />
            <NewPreview isVisible={isLivePre} />
          </Flex>
        </Box>
      </Flex>
    </>
  )
}

export default App
