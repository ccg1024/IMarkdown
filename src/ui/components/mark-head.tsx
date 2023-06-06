import { FC, useCallback } from 'react'
import {
  Tag,
  Box,
  Menu,
  Badge,
  MenuList,
  Editable,
  MenuButton,
  EditableInput,
  MenuOptionGroup,
  MenuItemOption,
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
  updateFileTag,
  RecentFilesStateItem
} from '../app/reducers/recentFilesSlice'

interface MarkTagProps {
  tag: string | string[]
}
export const MarkTag: FC<MarkTagProps> = ({ tag }): JSX.Element => {
  return <Tag colorScheme="teal">{tag}</Tag>
}

const MarkHeadInfo: FC = (): JSX.Element => {
  const currentFile: string = useSelector(selectCurrentFile)
  const recentFiles: RecentFilesStateItem = useSelector(selectRecentFiles)
  const reduxDispatch = useCallback(useDispatch(), [])
  const noteTitle = (currentFile && recentFiles[currentFile].title) || ''
  const noteTime = (currentFile && recentFiles[currentFile].date) || ''
  const noteDesc = (currentFile && recentFiles[currentFile].desc) || ''
  const noteTag = (currentFile && recentFiles[currentFile].tag) || 'default'

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

  const onChangeTag = useCallback(
    (nextValue: string) => {
      if (currentFile) {
        reduxDispatch(
          updateFileTag({
            id: currentFile,
            tag: nextValue
          })
        )

        window.ipcAPI.updateHeader({ tag: nextValue })
        if (!recentFiles[currentFile].isChange) {
          reduxDispatch(
            updateFileIsChange({
              id: currentFile,
              isChange: true
            })
          )
        }
      }
    },
    [currentFile]
  )

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
          <MenuButton>
            <MarkTag tag={noteTag} />
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              value={noteTag}
              type="radio"
              onChange={onChangeTag}
            >
              <MenuItemOption value="normal">normal</MenuItemOption>
              <MenuItemOption value="medium">medium</MenuItemOption>
              <MenuItemOption value="important">important</MenuItemOption>
            </MenuOptionGroup>
          </MenuList>
        </Menu>
        <BsChevronRight />
        <Badge fontSize="inherit" colorScheme="blue">
          {noteTime ? noteTime : 'Unknow time'}
        </Badge>
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
