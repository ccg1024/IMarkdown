import React, { FC, MouseEventHandler, useCallback } from 'react'
import {
  Text,
  Box,
  Editable,
  EditableInput,
  EditablePreview,
  useColorModeValue
} from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'
import { BsFullscreen, BsLayoutSplit } from 'react-icons/bs'
import { Global } from '@emotion/react'

import { selectCurrentFile } from '../../app/reducers/currentFileSlice'
import {
  selectRecentFiles,
  modifyFileTitle,
  modifyFileDesc,
  RecentFilesStateItem
} from '../../app/reducers/recentFilesSlice'

const MarkHeadInfoStyle: FC = (): JSX.Element => {
  return (
    <Global
      styles={{
        '.toggle-icon:hover': {
          cursor: 'pointer'
        }
      }}
    />
  )
}

interface MarkHeadInfoProps {
  fullScreenCallback: MouseEventHandler<SVGElement>
  livePreviewCallback: MouseEventHandler<SVGElement>
}

const MarkHeadInfo: FC<MarkHeadInfoProps> = (props): JSX.Element => {
  const currentFile: string = useSelector(selectCurrentFile)
  const recentFiles: RecentFilesStateItem = useSelector(selectRecentFiles)
  const reduxDispatch = useCallback(useDispatch(), [])
  const noteTitle = currentFile && recentFiles[currentFile].title
  const noteTime = currentFile && recentFiles[currentFile].date
  const noteDesc = currentFile && recentFiles[currentFile].desc

  const onChangeTitle = (nextValue: string) => {
    if (currentFile) {
      reduxDispatch(
        modifyFileTitle({
          id: currentFile,
          title: nextValue
        })
      )
      window.electronAPI.updateHeadInfo({ title: nextValue })
    }
  }
  const onChangeDesc = (nextValue: string) => {
    if (currentFile) {
      reduxDispatch(
        modifyFileDesc({
          id: currentFile,
          desc: nextValue
        })
      )
      window.electronAPI.updateHeadInfo({ desc: nextValue })
    }
  }

  return (
    <Box padding={4} marginBottom={2} fontSize="24px">
      <Box
        display="flex"
        justifyContent="space-between"
        gap={2}
        alignItems="center"
      >
        <Editable
          value={noteTitle}
          fontSize="1.2em"
          marginY={2}
          placeholder="Unname title"
          onChange={onChangeTitle}
          flexGrow={1}
        >
          <EditablePreview paddingLeft={2} />
          <EditableInput paddingLeft={2} />
        </Editable>
        <MarkHeadInfoStyle />
        <Box display="flex" gap={2} alignItems="center">
          <BsFullscreen
            className="toggle-icon"
            onClick={props.fullScreenCallback}
          />
          <BsLayoutSplit
            className="toggle-icon"
            onClick={props.livePreviewCallback}
          />
        </Box>
      </Box>
      <Box
        paddingLeft={2}
        gap={2}
        display="flex"
        fontSize="0.8em"
        color={useColorModeValue('gray.500', 'gray.500')}
      >
        <Text>NoteBook:</Text>
        <Text>{noteTime ? noteTime : 'Unknow time'}</Text>
      </Box>
      <Editable
        marginY={2}
        value={noteDesc}
        fontSize="0.8em"
        placeholder="no file description"
        onChange={onChangeDesc}
        color={useColorModeValue('gray.500', 'gray.500')}
      >
        <EditablePreview paddingLeft={2} />
        <EditableInput paddingLeft={2} />
      </Editable>
    </Box>
  )
}

export default MarkHeadInfo
