import { FC, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentFile } from '../app/reducers/currentFileSlice'
import { selectRecentFiles } from '../app/reducers/recentFilesSlice'
import { SideFileItemNew } from './side-file-item'

const SideRecentFiles: FC = (): JSX.Element => {
  const recentFiles = useSelector(selectRecentFiles)
  const currentFile = useSelector(selectCurrentFile)
  const recentPath: string[] = Object.keys(recentFiles)

  const openRencentFile = useCallback((path: string) => {
    window.ipcAPI.openRecentFile(path)
  }, [])
  return (
    <>
      {recentPath.map(path => {
        const file = recentFiles[path]
        return (
          <SideFileItemNew
            key={file.filepath}
            uuid={file.filepath}
            name={file.fileInfo.name}
            time={file.fileInfo.time}
            desc={file.fileInfo.firstLine}
            size={file.fileInfo.size}
            isChange={file.isChange}
            isActive={file.filepath === currentFile}
            onClick={openRencentFile}
          />
        )
      })}
    </>
  )
}

export default SideRecentFiles
