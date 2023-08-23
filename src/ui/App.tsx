import { Flex, Box } from '@chakra-ui/react'
import { FC, useRef, useCallback } from 'react'

import Editor, { EditorRef } from './components/editor'
import Preview from './components/preview'
import TitleBar from './components/title-bar'
import GhostInfo from './components/ghost-info'
import MarkHeadInfo from './components/mark-head'
import InterIcon from './components/interIcon'
import Sidebar, { SideBarRef } from './components/sidebar'
import HeadNav from './components/head-nav'
import Message, { MessageRefMethod } from './components/message'
import { useDocChange } from './hooks/useDocChange'
import { useConfig } from './hooks/useConfig'
import { useIpc } from './hooks/useIpc'

const App: FC = (): JSX.Element => {
  const editorRef = useRef<EditorRef>(null)
  const sideBarRef = useRef<SideBarRef>(null)
  const messageRef = useRef<MessageRefMethod>(null)

  const handleSidebar = useCallback((token: number) => {
    if (token === 1) {
      sideBarRef.current.toggleNav()
    } else {
      sideBarRef.current.toggleMid()
    }
  }, [])

  // ipc event listener
  const {
    showEditor,
    showHeader,
    showPreview,
    showHeadNav,
    setShowEditor,
    setShowHeader: _setShowHeader,
    setShowPreview,
    setShowHeadNav: _setShowHeadNav
  } = useIpc(editorRef, messageRef, handleSidebar)

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

  // listen editor content change
  useDocChange(editorRef)

  // config setting
  useConfig()

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
          {showHeader ? <MarkHeadInfo /> : <GhostInfo />}
          <Flex height="100%" width="100%" overflow="auto">
            <Editor ref={editorRef} isVisible={showEditor} />
            <Preview isVisible={showPreview} />
            <HeadNav isVisibale={showHeadNav} />
          </Flex>
          {showHeader && (
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
