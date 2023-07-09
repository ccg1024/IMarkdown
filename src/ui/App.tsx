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
import { IpcRendererEvent } from 'electron'
import { EditorView } from '@codemirror/view'

import Editor from './components/editor'
import Preview from './components/preview'
import TitleBar from './components/title-bar'
import GhostInfo from './components/ghost-info'
import MarkHeadInfo from './components/mark-head'
import pubsubConfig from '../config/pubsub.config'
import imardownPlugins from '../config/plugin-list.config'
import { concatHeaderAndContent, formateDate } from './libs/tools'
import { HeadInfo } from '../types/main'
import { updateFileContent } from './app/reducers/fileContentSlice'
import {
  updateFileIsChange,
  updateRecentFiles
} from './app/reducers/recentFilesSlice'
import { updateCurrentFile } from './app/reducers/currentFileSlice'
import InterIcon from './components/interIcon'
import Sidebar from './components/sidebar'
import HeadNav from './components/head-nav'
import { getMarkHead } from './app/store'
import ipcConfig from '../config/ipc.config'
import { clearToken } from './libs/generate-state'
import formateContent from './libs/formate-content'

interface FileToken {
  fullpath: string
  fileContent: string
  headInfo: HeadInfo
}

const App: FC = (): JSX.Element => {
  const [showEditor, setShowEditor] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [showHeadInfo, setShowHeadInfo] = useState<boolean>(false)
  const [showHeadNav, setShowHeadNav] = useState<boolean>(false)
  const editorRef = useRef<EditorView>(null)
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
      case 5:
        if (uiControl.current) {
          setShowHeadNav(v => !v)
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
      isChange: boolean,
      scrollPos: number
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

      PubSub.publish(pubsubConfig.UPDATE_EDITOR_STATE, {
        doc: fileContent,
        file: fullpath,
        scrollPos: scrollPos && scrollPos
      })
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
        PubSub.publish(pubsubConfig.UPDATE_EDITOR_STATE, {
          doc: initialFile.fileContent,
          file: initialFile.fullpath
        })
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
    window.ipcAPI.listenFileSave((event: IpcRendererEvent, path: string) => {
      try {
        const doc = editorRef.current?.state.doc.toString()
        const markHead = getMarkHead()
        if (doc && markHead) {
          const content = concatHeaderAndContent(markHead, doc)
          event.sender.send(ipcConfig.SAVE_CONTENT, content, doc, path)
          dispatch(
            updateFileIsChange({
              id: path,
              isChange: false
            })
          )
          clearToken('')
        }
      } catch (err) {
        // error handle
      }
    })
    window.ipcAPI.listenFormatFile(() => {
      // format content
      if (editorRef.current) {
        formateContent(editorRef.current)
      }
    })

    return () => {
      window.ipcAPI.removeFileOpenListener()
      window.ipcAPI.removeToggleViewListener()
      window.ipcAPI.removeFileSaveListener()
      window.ipcAPI.removeFormatFileListener()
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
          <Sidebar />
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
            <Editor ref={editorRef} isVisible={showEditor} />
            <Preview isVisible={showPreview} />
            <HeadNav isVisibale={showHeadNav} />
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
