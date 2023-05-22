import PubSub from 'pubsub-js'
import { Flex, Box } from '@chakra-ui/react'
import React, {
  FC,
  useRef,
  useState,
  useEffect,
  useCallback,
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

import { IScrollPosInfo, HeadInfo } from './tsx/types/render'
import { formatedTime } from './tsx/libs/tools'

const App: FC = (): JSX.Element => {
  const [showEditor, setShowEditor] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false)
  const [showHeadInfo, setShowHeadInfo] = useState<boolean>(false)
  const uiControl = useRef<boolean>(false)
  const scrollRef = useRef<IScrollPosInfo>({
    previewScrollTo: 1,
    previewScrollTop: 1,
    editorScrollTo: 1
  })
  const sideBarRef = useRef<HTMLDivElement>(null)
  const dispatch = useCallback(useDispatch(), [])
  const handleFullScreen = useCallback(() => {
    const siderBar = sideBarRef.current
    if (siderBar) {
      if (siderBar.style.display === 'none') {
        siderBar.style.display = 'block'
      } else {
        siderBar.style.display = 'none'
      }
    }
  }, [])
  const handleToggleLivePreview = useCallback(() => {
    setShowPreview(false)
    setShowEditor(true)
    setShowLivePreview(v => !v)
  }, [])
  const handleJustPreview = useCallback(() => {
    setShowEditor(false)
    setShowPreview(true)
    setShowLivePreview(false)
  }, [])
  const handleJustEditor = useCallback(() => {
    const editorScrollLine = getScrollLine(scrollRef.current.previewScrollTop)
    scrollRef.current.editorScrollTo = editorScrollLine
    scrollRef.current.previewScrollTo = editorScrollLine
    setShowEditor(true)
    setShowPreview(false)
    setShowLivePreview(false)
  }, [])
  const toggleView = useCallback((_event: any, value: number) => {
    switch (value) {
      case 1:
        if (uiControl.current) {
          setShowEditor(false)
          setShowPreview(true)
          setShowLivePreview(false)
        }
        break
      case 2:
        if (uiControl.current) {
          const editorScrollLine = getScrollLine(
            scrollRef.current.previewScrollTop
          )
          scrollRef.current.editorScrollTo = editorScrollLine
          scrollRef.current.previewScrollTo = editorScrollLine
          setShowEditor(true)
          setShowPreview(false)
          setShowLivePreview(false)
        }
        break
      case 3:
        if (uiControl.current) {
          setShowEditor(true)
          setShowPreview(false)
          setShowLivePreview(true)
        }
        break
      case 4:
        handleFullScreen()
        break
    }
  }, [])

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

  const handleOpenFile = (
    _event: any,
    fullPath: string,
    fileContent: string,
    headInfo: HeadInfo,
    isChange: boolean
  ) => {
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

  useLayoutEffect(() => {
    window.electronAPI.getConfigPath().then((configJson: string) => {
      try {
        const settings = JSON.parse(configJson)
        const editor = document.querySelector('#editor_Box') as HTMLDivElement
        const root = document.querySelector('#content_root') as HTMLDivElement

        for (const name in settings) {
          switch (name) {
            case 'fontSize':
              root.style.fontSize = settings[name]
              break
            case 'editorFontFamily':
              editor.style.fontFamily = settings[name]
              break
            case 'previewFontFamily':
              root.style.fontFamily = settings[name]
              break
          }
        }
      } catch (err) {
        console.log(err)
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
              justEditorCallback={handleJustEditor}
              justPreviewCallback={handleJustPreview}
              livePreviewCallback={handleToggleLivePreview}
            />
          ) : (
            <GhostInfo />
          )}
          <Flex height="100%" width="100%" overflow="auto">
            <Editor isVisible={showEditor} scrollLine={scrollRef.current} />
            <Preview isVisible={showPreview} scrollLine={scrollRef.current} />
            <NewPreview isVisible={showLivePreview} />
          </Flex>
        </Box>
      </Flex>
    </>
  )
}

export default App
