import { FC, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentFile } from '../app/reducers/currentFileSlice'
import { selectRecentFiles } from '../app/reducers/recentFilesSlice'
import { SideFileItem } from './side-file-item'

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
        return (
          <SideFileItem
            key={path}
            detail={recentFiles[path]}
            isActive={currentFile === path}
            clickCallback={openRencentFile}
          />
        )
      })}
    </>
  )
}

export default SideRecentFiles
