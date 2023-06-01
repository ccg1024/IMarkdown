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
import { BsChevronRight } from 'react-icons/bs'

import { selectCurrentFile } from '../app/reducers/currentFileSlice'
import {
  selectRecentFiles,
  updateFileTitle,
  updateFileDesc,
  updateFileIsChange,
  RecentFilesStateItem
} from '../app/reducers/recentFilesSlice'

const MarkHeadInfo: FC = (): JSX.Element => {
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

      if (!recentFiles[currentFile].isChange) {
        reduxDispatch(updateFileIsChange({ id: currentFile, isChange: true }))
      }
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
      if (!recentFiles[currentFile].isChange) {
        reduxDispatch(
          updateFileIsChange({
            id: currentFile,
            isChange: true
          })
        )
      }
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
    <Box padding={4} marginY={2}>
      <Editable
        value={noteTitle}
        fontSize="1.2em"
        marginY={2}
        placeholder="Unname title"
        onChange={onChangeTitle}
        flexGrow={1}
        selectAllOnFocus={false}
        fontWeight="bold"
      >
        <EditablePreview />
        <EditableInput spellCheck={false} _focus={{ boxShadow: 'none' }} />
      </Editable>
      <Box
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
        selectAllOnFocus={false}
      >
        <EditablePreview />
        <EditableInput spellCheck={false} _focus={{ boxShadow: 'none' }} />
      </Editable>
    </Box>
  )
}

export default MarkHeadInfo
