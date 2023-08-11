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
import { useNavigate } from 'react-router-dom'

import Editor, { EditorRef } from './components/editor'
import Preview from './components/preview'
import TitleBar from './components/title-bar'
import GhostInfo from './components/ghost-info'
import MarkHeadInfo from './components/mark-head'
import pubsubConfig from '../config/pubsub.config'
import imardownPlugins from '../config/plugin-list.config'
import { concatHeaderAndContent } from './libs/tools'
import { MarkFile, OpenFileType } from '../types'
import { updateFileContent, updateFile } from './app/reducers/fileContentSlice'
import {
  updateFileIsChange,
  updateRecentFiles
} from './app/reducers/recentFilesSlice'
import { updateCurrentFile } from './app/reducers/currentFileSlice'
import InterIcon from './components/interIcon'
import Sidebar, { SideBarRef } from './components/sidebar'
import HeadNav from './components/head-nav'
import { didModified, getCurrentFile, getDoc, getMarkHead } from './app/store'
import ipcConfig from '../config/ipc.config'
import formateContent from './libs/formate-content'
import { updateDirlist } from './app/reducers/dirlistSlice'
import Message, { MessageRefMethod } from './components/message'

type UpdateGate = {
  isChangeGate: boolean
}

const updateGate: UpdateGate = {
  isChangeGate: false
}

const App: FC = (): JSX.Element => {
  const [showEditor, setShowEditor] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [showHeadInfo, setShowHeadInfo] = useState<boolean>(false)
  const [showHeadNav, setShowHeadNav] = useState<boolean>(false)
  const editorRef = useRef<EditorRef>(null)
  const uiControl = useRef<boolean>(false)
  const sideBarRef = useRef<SideBarRef>(null)
  const messageRef = useRef<MessageRefMethod>(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleFullScreen = useCallback((token: number) => {
    if (token === 1) {
      sideBarRef.current.toggleNav()
    } else {
      sideBarRef.current.toggleMid()
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
  const toggleView = useCallback((_: IpcRendererEvent, value: number) => {
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
          handleFullScreen(1)
        }
        break
      case 5:
        if (uiControl.current) {
          setShowHeadNav(v => !v)
        }
        break
      case 6:
        if (uiControl.current) {
          handleFullScreen(2)
        }
        break
    }
  }, [])

  const handleDirOpen = (_: IpcRendererEvent, markFile: MarkFile[]) => {
    dispatch(updateDirlist(markFile))
    navigate('main_window/folder')
  }

  const handleFileOpen = (_: IpcRendererEvent, openFileInfo: OpenFileType) => {
    // update old file cache before toggle to new file
    // when file was modified
    const isModified = didModified()
    if (isModified) {
      const header = getMarkHead()
      const doc = getDoc()
      const currentFile = getCurrentFile()
      window.ipcAPI.updateDocCache({
        filepath: currentFile,
        fileData: { content: doc }
      })
      window.ipcAPI.updateHeader({
        filepath: currentFile,
        fileData: {
          headInfo: header
        }
      })
    }

    // update recent files
    const { fileInfo, fileData } = openFileInfo
    dispatch(
      updateFile({
        content: fileData.content,
        headinfo: fileData.headInfo
      })
    )
    dispatch(
      updateRecentFiles({
        filepath: fileInfo.id,
        fileInfo: fileInfo,
        isChange: fileData.isChange,
        didModified: false
      })
    )
    dispatch(updateCurrentFile(openFileInfo.fileInfo.id))
    setShowEditor(true)
    setShowHeadInfo(true)
    if (!uiControl.current) {
      uiControl.current = true
    }

    PubSub.publish(pubsubConfig.UPDATE_EDITOR_STATE, {
      doc: fileData.content,
      file: fileInfo.id,
      scrollPos: fileData.scrollPos && fileData.scrollPos
    })
    updateGate.isChangeGate = false
  }

  // check if file is loaded
  useEffect(() => {
    // window.ipcAPI.initRenderer().then((result: string) => {
    //   if (result) {
    //     const initialFile = JSON.parse(result) as FileToken
    //     dispatch(updateFileContent(initialFile.fileContent))
    //     dispatch(
    //       updateRecentFiles({
    //         id: initialFile.fullpath,
    //         date: formateDate(initialFile.headInfo.date),
    //         desc: initialFile.headInfo.desc,
    //         title: initialFile.headInfo.title,
    //         isChange: false,
    //         tag: initialFile.headInfo.tag
    //       })
    //     )
    //     dispatch(updateCurrentFile(initialFile.fullpath))
    //     PubSub.publish(pubsubConfig.UPDATE_EDITOR_STATE, {
    //       doc: initialFile.fileContent,
    //       file: initialFile.fullpath
    //     })
    //     setShowEditor(true)
    //     setShowHeadInfo(true)
    //     uiControl.current = true
    //   }
    // })
  }, [])

  // ipc event listener
  useEffect(() => {
    window.ipcAPI.listenOpenDir(handleDirOpen)
    window.ipcAPI.listenFileOpen(handleFileOpen)
    window.ipcAPI.listenToggleView(toggleView)
    window.ipcAPI.listenFileSave((event: IpcRendererEvent, path: string) => {
      try {
        const doc = editorRef.current?.getDoc()
        const markHead = getMarkHead()
        if (doc && markHead) {
          const content = concatHeaderAndContent(markHead, doc)
          event.sender.send(ipcConfig.SAVE_CONTENT, {
            headInfo: markHead,
            content: content,
            doc: doc,
            filepath: path
          })
          dispatch(
            updateFileIsChange({
              filepath: path,
              isChange: false
            })
          )
          updateGate.isChangeGate = false
          if (messageRef) {
            messageRef.current.showMessage(`${path}`)
          }
        }
      } catch (err) {
        // error handle
      }
    })
    window.ipcAPI.listenFormatFile(() => {
      // format content
      const editor = editorRef.current.getEditor()
      if (editor) {
        formateContent(editor)
      }
    })

    return () => {
      window.ipcAPI.removeDirOpenListener()
      window.ipcAPI.removeFileOpenListener()
      window.ipcAPI.removeToggleViewListener()
      window.ipcAPI.removeFileSaveListener()
      window.ipcAPI.removeFormatFileListener()
    }
  }, [])

  // listen editor content change
  useEffect(() => {
    function updateContent() {
      const editorContent = editorRef.current?.getDoc()
      const filepath = editorRef.current.getFileName()
      dispatch(updateFileContent(editorContent))
      // NOTE: unnecessary updates
      // just need update cache when save file and toggle file
      // window.ipcAPI.updateDocCache({
      //   filepath: filepath,
      //   fileData: { content: editorContent }
      // })
    }
    // const updateContentDebounce = _.debounce(updateContent, 300)

    const contentToken = PubSub.subscribe(
      pubsubConfig.UPDATE_EDITOR_CONTENT,
      () => {
        const editorFile = editorRef.current?.getFileName()

        // update file change
        if (editorFile && !updateGate.isChangeGate) {
          dispatch(updateFileIsChange({ filepath: editorFile, isChange: true }))
          updateGate.isChangeGate = true
        }

        // update file content
        updateContent()
      }
    )

    function clear() {
      PubSub.unsubscribe(contentToken)
    }
    return clear
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
        <Box height="100%" flexShrink={0} display="flex">
          <Sidebar ref={sideBarRef} />
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
      <Message ref={messageRef} />
    </>
  )
}

export default App
