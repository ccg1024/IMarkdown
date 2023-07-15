import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { selectDirlist } from '../app/reducers/dirlistSlice'
import { selectCurrentFile } from '../app/reducers/currentFileSlice'
import { selectRecentFiles } from '../app/reducers/recentFilesSlice'
import { SideFileItem } from './side-file-item'

const SideDirlist: React.FC = () => {
  const dirlist = useSelector(selectDirlist)
  const currentFile = useSelector(selectCurrentFile)
  const recentFiles = useSelector(selectRecentFiles)

  const openFile = useCallback((filepath: string) => {
    window.ipcAPI.openDirFile(filepath)
  }, [])
  return (
    <>
      {dirlist?.map(file => {
        const detail = {
          id: file.id,
          date: file.time,
          title: file.name,
          isChange:
            currentFile && recentFiles[currentFile]
              ? recentFiles[currentFile].isChange
              : false,
          desc: 'file size ' + file.size
        }
        return (
          <SideFileItem
            key={file.id}
            detail={detail}
            isActive={currentFile === file.id}
            clickCallback={openFile}
          />
        )
      })}
    </>
  )
}

export default SideDirlist
