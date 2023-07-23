import React, { FC } from 'react'
import {
  Box,
  Text,
  Editable,
  EditableInput,
  EditablePreview,
  useColorModeValue
} from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'
import { BsChevronRight } from 'react-icons/bs'

import { selectCurrentFile } from '../app/reducers/currentFileSlice'
import {
  selectRecentFiles,
  updateFileIsChange,
  RecentFilesStateItem
} from '../app/reducers/recentFilesSlice'
import {
  selectFileHeadInfo,
  updateFileHeadInfo
} from '../app/reducers/fileContentSlice'
import { HeadInfo } from '../../types/main'

type MarkTagProps = {
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

export const MarkTag: FC<MarkTagProps> = (props): JSX.Element => {
  const { children, ...rest } = props
  return (
    <Box
      borderRadius="md"
      fontSize="inherit"
      lineHeight={1}
      backgroundColor="darkorange"
      color="white"
      paddingX={2}
      paddingY={1}
      display="flex"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      {...rest}
    >
      {children}
    </Box>
  )
}

function getArrayTag(tag: string | string[]): string[] {
  if (tag instanceof Array) return tag
  const wrapper: string[] = []
  wrapper.push(tag)
  return wrapper
}

const MarkHeadInfo: FC = (): JSX.Element => {
  const currentFile: string = useSelector(selectCurrentFile)
  const recentFiles: RecentFilesStateItem = useSelector(selectRecentFiles)
  const headInfo = useSelector(selectFileHeadInfo)

  const reduxDispatch = useDispatch()
  const noteTitle = headInfo.title || ''
  const noteDesc = headInfo.desc || ''
  const noteTag: string[] = headInfo.tag ? getArrayTag(headInfo.tag) : []

  const makeChange = () => {
    if (!recentFiles[currentFile].isChange) {
      reduxDispatch(
        updateFileIsChange({
          filepath: currentFile,
          isChange: true
        })
      )
    }
  }
  const updateFun = (headInfo: HeadInfo) => {
    if (currentFile) {
      reduxDispatch(updateFileHeadInfo(headInfo))
      window.ipcAPI.updateHeader({
        filepath: currentFile,
        fileData: {
          headInfo: headInfo
        }
      })
      makeChange()
    }
  }

  return (
    <Box padding={4}>
      <Editable
        value={noteTitle}
        fontSize="1.2em"
        marginY={2}
        placeholder="Unname title"
        onChange={(nextValue: string) => updateFun({ title: nextValue })}
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
        <Text lineHeight={1}>note text</Text>
        <BsChevronRight />
        {noteTag.map((tag, index) => (
          <MarkTag key={index}>{tag}</MarkTag>
        ))}
        <MarkTag color="gray" style={{ backgroundColor: 'lightgray' }}>
          add Tag
        </MarkTag>
      </Box>
      <Editable
        marginY={2}
        value={noteDesc}
        fontSize="0.8em"
        placeholder="no file description"
        onChange={(nextValue: string) => updateFun({ desc: nextValue })}
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
