import PubSub from 'pubsub-js'
import { FC, MouseEventHandler, MouseEvent, useCallback } from 'react'
import {
  Text,
  Box,
  Menu,
  MenuList,
  MenuItem,
  Editable,
  MenuButton,
  EditableInput,
  EditablePreview,
  useColorModeValue
} from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'
import {
  BsEye,
  BsPencil,
  BsFullscreen,
  BsLayoutSplit,
  BsChevronRight
} from 'react-icons/bs'
import { Global } from '@emotion/react'

import pubsubConfig from '../../config/pubsub.config'
import { selectCurrentFile } from '../app/reducers/currentFileSlice'
import {
  selectRecentFiles,
  updateFileTitle,
  updateFileDesc,
  RecentFilesStateItem
} from '../app/reducers/recentFilesSlice'

const MarkHeadInfoStyle: FC = (): JSX.Element => {
  return (
    <Global
      styles={{
        '.toggle-icon': {
          color: useColorModeValue(
            'var(--chakra-colors-gray-200)',
            'var(--chakra-colors-gray-200)'
          )
        },
        '.toggle-icon:hover': {
          cursor: 'pointer',
          color: useColorModeValue(
            'var(--chakra-colors-gray-500)',
            'var(--chakra-colors-gray-500)'
          )
        }
      }}
    />
  )
}

interface MarkHeadInfoProps {
  fullScreenCallback: MouseEventHandler<SVGElement>
  livePreviewCallback: MouseEventHandler<SVGElement>
  justPreviewCallback: MouseEventHandler<SVGElement>
  justEditorCallback: MouseEventHandler<SVGElement>
}

interface MarkHeadInfoControlGate {
  statuslineGate: number | null
}

const controlGate: MarkHeadInfoControlGate = {
  statuslineGate: null
}

const MarkHeadInfo: FC<MarkHeadInfoProps> = (props): JSX.Element => {
  const currentFile: string = useSelector(selectCurrentFile)
  const recentFiles: RecentFilesStateItem = useSelector(selectRecentFiles)
  const reduxDispatch = useCallback(useDispatch(), [])
  const noteTitle = (currentFile && recentFiles[currentFile].title) || ''
  const noteTime = (currentFile && recentFiles[currentFile].date) || ''
  const noteDesc = (currentFile && recentFiles[currentFile].desc) || ''

  const onChangeTitle = (nextValue: string) => {
    if (currentFile) {
      reduxDispatch(
        updateFileTitle({
          id: currentFile,
          title: nextValue
        })
      )
      window.ipcAPI.updateHeader({ title: nextValue })

      if (controlGate.statuslineGate) {
        window.clearTimeout(controlGate.statuslineGate)
      }
      controlGate.statuslineGate = window.setTimeout(() => {
        PubSub.publish(pubsubConfig.UPDATE_STATUS_LINE, true)
      }, 500)
    }
  }
  const onChangeDesc = (nextValue: string) => {
    if (currentFile) {
      reduxDispatch(
        updateFileDesc({
          id: currentFile,
          desc: nextValue
        })
      )
      window.ipcAPI.updateHeader({ desc: nextValue })
      if (controlGate.statuslineGate) {
        window.clearTimeout(controlGate.statuslineGate)
      }
      controlGate.statuslineGate = window.setTimeout(() => {
        PubSub.publish(pubsubConfig.UPDATE_STATUS_LINE, true)
      }, 500)
    }
  }
  const clickMenu: MouseEventHandler<HTMLDivElement> = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    const { target } = event

    if (target) {
      const tag = (target as HTMLButtonElement).dataset.tag
      if (tag) {
        // console.log(tag)
      }
    }
  }

  return (
    <Box padding={4} marginBottom={2}>
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
        <Box display="flex" gap={2} alignItems="center" marginRight={2}>
          <BsFullscreen
            className="toggle-icon"
            onClick={props.fullScreenCallback}
          />
          <BsLayoutSplit
            className="toggle-icon"
            onClick={props.livePreviewCallback}
          />
          <BsEye className="toggle-icon" onClick={props.justPreviewCallback} />
          <BsPencil
            className="toggle-icon"
            onClick={props.justEditorCallback}
          />
        </Box>
      </Box>
      <Box
        paddingLeft={2}
        gap={2}
        display="flex"
        fontSize="0.8em"
        alignItems="center"
        color={useColorModeValue('gray.500', 'gray.500')}
      >
        <Menu>
          <MenuButton>NoteBook</MenuButton>
          <MenuList onClick={clickMenu}>
            <MenuItem data-tag="tag one">In development</MenuItem>
            <MenuItem data-tag="tag two">In development</MenuItem>
            <MenuItem data-tag="tag three">In development</MenuItem>
          </MenuList>
        </Menu>
        <BsChevronRight />
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
