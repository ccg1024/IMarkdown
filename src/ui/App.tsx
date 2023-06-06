import PubSub from 'pubsub-js'
import { Flex, Box } from '@chakra-ui/react'
import {
  FC,
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect
} from 'react'
import { useDispatch } from 'react-redux'

import Editor from './components/editor'
import Preview from './components/preview'
import SideBar from './components/side-bar'
import TitleBar from './components/title-bar'
import GhostInfo from './components/ghost-info'
import MarkHeadInfo from './components/mark-head'
import pubsubConfig from '../config/pubsub.config'
import imardownPlugins from '../config/plugin-list.config'
import { formateDate } from './libs/tools'
import { HeadInfo } from '../types/main'
import { updateFileContent } from './app/reducers/fileContentSlice'
import { updateRecentFiles } from './app/reducers/recentFilesSlice'
import { updateCurrentFile } from './app/reducers/currentFileSlice'
import InterIcon from './components/interIcon'

interface FileToken {
  fullpath: string
  fileContent: string
  headInfo: HeadInfo
}

const App: FC = (): JSX.Element => {
  const [showEditor, setShowEditor] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [showHeadInfo, setShowHeadInfo] = useState<boolean>(false)
  const uiControl = useRef<boolean>(false)
  const sideBarRef = useRef<HTMLDivElement>(null)
  const dispatch = useCallback(useDispatch(), [])
  const handleFullScreen = useCallback(() => {
    const siderBar = sideBarRef.current
    if (siderBar) {
      if (siderBar.style.display === 'none') {
        siderBar.style.display = 'flex'
      } else {
        siderBar.style.display = 'none'
      }
    }
  }, [])
  const handleToggleLivePreview = useCallback(() => {
    setShowEditor(true)
    setShowPreview(true)
  }, [])
  const handleJustPreview = useCallback(() => {
    setShowEditor(false)
    setShowPreview(true)
  }, [])
  const handleJustEditor = useCallback(() => {
    setShowEditor(true)
    setShowPreview(false)
  }, [])
  const toggleView = useCallback((_: any, value: number) => {
    switch (value) {
      case 1:
        if (uiControl.current) {
          handleJustPreview()
        }
        break
      case 2:
        if (uiControl.current) {
          handleJustEditor()
        }
        break
      case 3:
        if (uiControl.current) {
          handleToggleLivePreview()
        }
        break
      case 4:
        if (uiControl.current) {
          handleFullScreen()
        }
        break
    }
  }, [])

  const handleFileOpen = useCallback(
    (
      _: any,
      fullpath: string,
      fileContent: string,
      headInfo: HeadInfo,
      isChange: boolean
    ) => {
      dispatch(updateFileContent(fileContent))
      dispatch(
        updateRecentFiles({
          id: fullpath,
          date: formateDate(headInfo.date),
          desc: headInfo.desc,
          title: headInfo.title,
          isChange: isChange,
          tag: headInfo.tag
        })
      )
      dispatch(updateCurrentFile(fullpath))
      setShowEditor(true)
      setShowHeadInfo(true)
      if (!uiControl.current) {
        uiControl.current = true
      }

      PubSub.publish(pubsubConfig.UPDATE_EDITOR_STATE, fileContent)
      // PubSub.publish(pubsubConfig.UPDATE_STATUS_LINE, isChange)
    },
    []
  )

  // check if file is loaded
  useEffect(() => {
    window.ipcAPI.initRenderer().then((result: string) => {
      if (result) {
        const initialFile = JSON.parse(result) as FileToken
        dispatch(updateFileContent(initialFile.fileContent))
        dispatch(
          updateRecentFiles({
            id: initialFile.fullpath,
            date: formateDate(initialFile.headInfo.date),
            desc: initialFile.headInfo.desc,
            title: initialFile.headInfo.title,
            isChange: false,
            tag: initialFile.headInfo.tag
          })
        )
        dispatch(updateCurrentFile(initialFile.fullpath))
        PubSub.publish(
          pubsubConfig.UPDATE_EDITOR_STATE,
          initialFile.fileContent
        )
        setShowEditor(true)
        setShowHeadInfo(true)
        uiControl.current = true
      }
    })
  }, [])

  // ipc event listener
  useEffect(() => {
    window.ipcAPI.listenFileOpen(handleFileOpen)
    window.ipcAPI.listenToggleView(toggleView)

    return () => {
      window.ipcAPI.removeFileOpenListener()
      window.ipcAPI.removeToggleViewListener()
    }
  }, [])

  // config setting
  useLayoutEffect(() => {
    window.ipcAPI.getConfig().then((result: string) => {
      try {
        const settings = JSON.parse(result)
        const editor = document.querySelector('#editor_box') as HTMLDivElement
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
            case 'vimSupport':
              PubSub.publish(pubsubConfig.UPDATE_DYNAMIC_PLUGINS, {
                [imardownPlugins.VIM]: settings[name]
              })
              break
          }
        }
      } catch (err) {
        throw err
      }
    })
  }, [])

  return (
    <>
      <Flex height="100%" width="100%" id="content_root">
        <Box ref={sideBarRef} height="100%" flexShrink={0} display="flex">
          <SideBar />
        </Box>
        <Box
          display="flex"
          flexGrow={1}
          height="100%"
          flexDirection="column"
          position="relative"
          overflow="auto"
        >
          <TitleBar />
          {showHeadInfo ? <MarkHeadInfo /> : <GhostInfo />}
          <Flex height="100%" width="100%" overflow="auto">
            <Editor isVisible={showEditor} />
            <Preview isVisible={showPreview} />
          </Flex>
          {showHeadInfo && (
            <InterIcon
              justEditorCallback={handleJustEditor}
              justPreviewCallback={handleJustPreview}
              livePreviewCallback={handleToggleLivePreview}
            />
          )}
        </Box>
      </Flex>
    </>
  )
}

export default App
