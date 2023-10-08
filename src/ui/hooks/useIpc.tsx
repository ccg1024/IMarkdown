import { IpcRendererEvent } from 'electron'
import React, { useEffect, MutableRefObject, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ipcConfig from 'src/config/ipc.config'
import { MarkFile, OpenFileType } from 'src/types'
import { updateCurrentFile } from '../app/reducers/currentFileSlice'
import { updateDirlist } from '../app/reducers/dirlistSlice'
import {
  updateFileIsChange,
  updateRecentFiles
} from '../app/reducers/recentFilesSlice'
import { getCurrentFile, getMarkHead } from '../app/store'
import { EditorRef } from '../components/editor'
import { MessageRefMethod } from '../components/message'
import formateContent from '../libs/formate-content'
import { concatHeaderAndContent } from '../libs/tools'

type SetFn<T> = React.Dispatch<React.SetStateAction<T>>

let uiControl = false

/**
 * A hook that register ipc listener
 *
 * @param editorRef A ref which refer to a wrapped codemirror instance
 */
export const useIpc = (
  editorRef: MutableRefObject<EditorRef>,
  msgRef: MutableRefObject<MessageRefMethod>,
  setSidebar: (token: number) => void
) => {
  // some thing
  const [showEditor, setShowEditor] = useState(false)
  const [showHeader, setShowHeader] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showHeadNav, setShowHeadNav] = useState(false)
  useOpenDirIpc()
  useOpenFileIpc(editorRef, setShowEditor, setShowHeader)
  useSaveFileIpc(editorRef, msgRef)
  useFormateIpc(editorRef)
  useViewIpc(setShowEditor, setShowPreview, setShowHeadNav, setSidebar)

  return {
    showEditor,
    showHeader,
    showPreview,
    showHeadNav,
    setShowEditor,
    setShowHeader,
    setShowPreview,
    setShowHeadNav
  }
}

/**
 * A hook that register open dir ipc listener
 */
export const useOpenDirIpc = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  useEffect(() => {
    const handleDirOpen = (_e: IpcRendererEvent, markFile: MarkFile[]) => {
      dispatch(updateDirlist(markFile))
      navigate('main_window/folder')
    }
    window.ipcAPI.listenOpenDir(handleDirOpen)

    return () => {
      window.ipcAPI.removeDirOpenListener()
    }
  })
}

/**
 * A hook that register open file ipc listener
 *
 * @param editorRef A ref which refer to a wrapped codemirror instance
 * @param setShowEditor A set state func which is seconde return of setState()
 * @param setShowHeader A set state func which is seconde return of setState()
 */
export const useOpenFileIpc = (
  editorRef: MutableRefObject<EditorRef>,
  setShowEditor: SetFn<boolean>,
  setShowHeader: SetFn<boolean>
) => {
  const dispatch = useDispatch()
  useEffect(() => {
    const handleFileOpen = (
      _e: IpcRendererEvent,
      openFileInfo: OpenFileType
    ) => {
      // save scroll pos of old file
      const filepath = getCurrentFile()
      const editor = editorRef.current.getEditor()
      if (filepath && editor) {
        const scrollTop = editor.scrollDOM.scrollTop
        const blockInfo = editor.elementAtHeight(scrollTop)
        window.ipcAPI.updateScrollPos({
          filepath,
          fileData: {
            scrollPos: blockInfo.from
          }
        })
      }

      // update old file cache before toggle to other file
      // when file was modified
      if (window.imarkdown.didModified) {
        const header = getMarkHead()
        const doc = editorRef.current.getDoc()
        window.ipcAPI.updateDocCache({
          filepath,
          fileData: { content: doc }
        })
        window.ipcAPI.updateHeader({
          filepath,
          fileData: {
            headInfo: header
          }
        })
      }

      // update recent files
      const { fileInfo, fileData } = openFileInfo
      dispatch(
        updateCurrentFile({
          doc: fileData.content,
          headinfo: fileData.headInfo,
          filepath: fileInfo.id,
          scrollPos: fileData.scrollPos
        })
      )
      dispatch(
        updateRecentFiles({
          filepath: fileInfo.id,
          fileInfo: fileInfo,
          isChange: fileData.isChange
        })
      )

      setShowEditor(true)
      setShowHeader(true)
      uiControl = true
      window.imarkdown.didModified = false
    }

    window.ipcAPI.listenFileOpen(handleFileOpen)
    window.ipcAPI.initRenderer().then((res: OpenFileType) => {
      if (res) {
        handleFileOpen(null, res)
      }
    })

    return () => {
      window.ipcAPI.removeFileOpenListener()
    }
  }, [])
}

export const useSaveFileIpc = (
  editorRef: MutableRefObject<EditorRef>,
  msgRef: MutableRefObject<MessageRefMethod>
) => {
  const dispatch = useDispatch()
  useEffect(() => {
    const fileSave = (event: IpcRendererEvent, filepath: string) => {
      try {
        const doc = editorRef.current?.getDoc()
        const header = getMarkHead()
        if (doc && header) {
          const content = concatHeaderAndContent(header, doc)
          event.sender.send(ipcConfig.SAVE_CONTENT, {
            headInfo: header,
            content: content,
            doc: doc,
            filepath
          })
          dispatch(
            updateFileIsChange({
              filepath,
              isChange: false
            })
          )
          window.imarkdown.didModified = false
          if (msgRef.current) {
            msgRef.current.showMessage(`${filepath}`)
          }
        }
      } catch {
        // handle err
      }
    }

    window.ipcAPI.listenFileSave(fileSave)

    return () => {
      window.ipcAPI.removeFileSaveListener()
    }
  }, [])
}

export const useFormateIpc = (editorRef: MutableRefObject<EditorRef>) => {
  useEffect(() => {
    const handleFormate = () => {
      const editor = editorRef.current.getEditor()
      if (editor) {
        formateContent(editor)
      }
    }

    window.ipcAPI.listenFormatFile(handleFormate)

    return () => {
      window.ipcAPI.removeFormatFileListener()
    }
  }, [])
}

export const useViewIpc = (
  setEditor: SetFn<boolean>,
  setPreview: SetFn<boolean>,
  setHeadNav: SetFn<boolean>,
  setSidebar: (token: number) => void
) => {
  useEffect(() => {
    const view = (_e: IpcRendererEvent, v: number) => {
      if (!uiControl) {
        return
      }
      switch (v) {
        case 1:
          setEditor(false)
          setPreview(true)
          break
        case 2:
          setEditor(true)
          setPreview(false)
          break
        case 3:
          setEditor(true)
          setPreview(true)
          break
        case 4:
          setSidebar(1)
          break
        case 5:
          setHeadNav(v => !v)
          break
        case 6:
          setSidebar(2)
          break
      }
    }

    window.ipcAPI.listenToggleView(view)

    return () => {
      window.ipcAPI.removeToggleViewListener()
    }
  }, [])
}
