import React, { FC, ReactNode, useCallback } from 'react'
import {
  Box,
  Text,
  Flex,
  List,
  ListItem,
  Heading,
  Input,
  useColorModeValue
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { BsMarkdown } from 'react-icons/bs'

import uiColor from '../../libs/colors'
import {
  RecentFilesPayload,
  RecentFilesStateItem
} from '../../app/reducers/recentFilesSlice'
import { selectRecentFiles } from '../../app/reducers/recentFilesSlice'
import { selectCurrentFile } from '../../app/reducers/currentFileSlice'

interface SideBarDetailItemProps {
  detail: RecentFilesPayload
  isActive: boolean
  clickCallback: Function
}

interface SideBarDetailProps {
  children: ReactNode
}

const SideBarDetailItem: FC<SideBarDetailItemProps> = (props): JSX.Element => {
  return (
    <ListItem
      p={1}
      id={props.detail.id}
      borderBottom="1px"
      borderStyle="solid"
      borderColor={useColorModeValue('gray.300', 'gray.300')}
      backgroundColor={props.isActive ? 'blue.500' : 'unset'}
      onClick={
        props.isActive ? () => {} : e => props.clickCallback(e.currentTarget.id)
      }
      _hover={{
        backgroundColor: props.isActive ? 'blue.500' : 'blue.50',
        cursor: 'pointer'
      }}
    >
      <Flex
        overflow="hidden"
        alignItems="start"
        flexDirection="column"
        paddingX={2}
        paddingY={4}
      >
        <Heading
          width="100%"
          fontSize="1.2em"
          overflow="hidden"
          marginBottom={2}
          whiteSpace="nowrap"
          fontFamily="inherit"
          textOverflow="ellipsis"
          color={props.isActive ? 'white' : 'black'}
        >
          {props.detail.title ? props.detail.title : 'Unname title'}
        </Heading>
        <Text fontSize="0.8em" color={props.isActive ? 'white' : 'black'}>
          {props.detail.date ? props.detail.date : 'Unknow time'}
        </Text>
        <Text
          width="100%"
          overflow="hidden"
          fontSize="1em"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          color={props.isActive ? 'white' : 'black'}
        >
          {props.detail.desc ? props.detail.desc : 'no description'}
        </Text>
      </Flex>
    </ListItem>
  )
}

const SideBarDetail: FC<SideBarDetailProps> = (props): JSX.Element => {
  return (
    <Box
      id="menu-content"
      width="55%"
      height="100%"
      backdropBlur="8px"
      backdropFilter="auto"
      overflow="auto"
      backgroundColor={useColorModeValue(
        uiColor.leftSideBar.backgroundColorLight,
        uiColor.leftSideBar.backgroundColorDark
      )}
    >
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        marginBottom={4}
      >
        <Text
          as="h1"
          padding={2}
          textAlign="center"
          userSelect={'none'}
          fontSize="1.1em"
          color={useColorModeValue('gray.400', 'gray.400')}
        >
          Recent Files
        </Text>
        <Input
          width="90%"
          height="inherit"
          padding={2}
          fontSize="1.1em"
          placeholder="Filter"
          backgroundColor={useColorModeValue('white', 'white')}
        />
      </Flex>
      <List>{props.children}</List>
    </Box>
  )
}

const FixedLeftBar: FC = (): JSX.Element => {
  return (
    <Box
      id="fixed-side-bar"
      boxShadow="lg"
      backgroundColor={useColorModeValue(
        uiColor.leftSideBarFixed.backgroundColorLight,
        uiColor.leftSideBarFixed.backgroundColorDark
      )}
      color={useColorModeValue('gray.300', 'gray.300')}
      width="45%"
    >
      <Flex alignItems="center" paddingY={2} paddingX={4}>
        <BsMarkdown style={{ fontSize: '1.5em' }} />
        <Text
          marginLeft={2}
          fontSize="1.1em"
          textAlign="left"
          userSelect="none"
        >
          Imarkdown
        </Text>
      </Flex>
      <List>
        <ListItem
          paddingY={2}
          paddingX={4}
          fontSize="1.1em"
          textAlign="left"
          userSelect="none"
          backgroundColor={uiColor.leftSideBarFixed.activeColorLight}
          _hover={{ cursor: 'pointer' }}
        >
          Recent Files
        </ListItem>
      </List>
    </Box>
  )
}

const SideBar: FC = (): JSX.Element => {
  const recentFiles: RecentFilesStateItem = useSelector(selectRecentFiles)
  const currentFile: string = useSelector(selectCurrentFile)

  const openRecentFile = useCallback((filePath: string) => {
    window.electronAPI.openRecentFile(filePath)
  }, [])

  const recentPaths: string[] = Object.keys(recentFiles)

  return (
    <Box id="side-bar" display="flex" flexShrink={0} height="100%">
      <FixedLeftBar />
      <SideBarDetail>
        {recentPaths.map(item => {
          return (
            <SideBarDetailItem
              key={item}
              detail={recentFiles[item]}
              isActive={currentFile === item}
              clickCallback={openRecentFile}
            />
          )
        })}
      </SideBarDetail>
    </Box>
  )
}

export default SideBar