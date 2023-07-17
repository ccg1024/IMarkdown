import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { selectDirlist } from '../app/reducers/dirlistSlice'
import { selectCurrentFile } from '../app/reducers/currentFileSlice'
import { selectRecentFiles } from '../app/reducers/recentFilesSlice'
import { SideFileItemNew } from './side-file-item'

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
        const isChange = recentFiles[file.id]
          ? recentFiles[file.id].isChange
          : false
        return (
          <SideFileItemNew
            key={file.id}
            uuid={file.id}
            name={file.name}
            time={file.time}
            size={file.size}
            isChange={isChange}
            isActive={currentFile === file.id}
            onClick={openFile}
          />
        )
      })}
    </>
  )
}

export default SideDirlist
