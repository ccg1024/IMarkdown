import {
  FC,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  useCallback
} from 'react'
import {
  Box,
  Text,
  Flex,
  List,
  ListItem,
  Heading,
  Input,
  Badge,
  useColorModeValue
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { BsMarkdown, BsThreeDotsVertical } from 'react-icons/bs'

import {
  RecentFilesPayload,
  RecentFilesStateItem
} from '../app/reducers/recentFilesSlice'

import { selectRecentFiles } from '../app/reducers/recentFilesSlice'
import { selectCurrentFile } from '../app/reducers/currentFileSlice'

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
        <Flex gap={2} alignItems="center">
          <Text fontSize="0.8em" color={props.isActive ? 'white' : 'black'}>
            {props.detail.date ? props.detail.date : 'Unknow time'}
          </Text>
          {props.detail.isChange && (
            <Badge borderRadius="md" colorScheme="red">
              changed
            </Badge>
          )}
        </Flex>
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
      backgroundColor={useColorModeValue('#F4F4F3', '#F4F4F3')}
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
  const clickMenu: MouseEventHandler<HTMLDivElement> = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      window.ipcAPI.openMenu(event.clientX, event.clientY)
    },
    []
  )
  return (
    <Box
      id="fixed-side-bar"
      boxShadow="lg"
      backgroundColor={useColorModeValue('#171920', '#171920')}
      color={useColorModeValue('gray.300', 'gray.300')}
      width="45%"
    >
      <Flex
        alignItems="center"
        paddingY={2}
        paddingX={4}
        justifyContent="space-between"
      >
        <Box alignItems="center" display="flex">
          <BsMarkdown
            style={{
              fontSize: '1.5em',
              color: useColorModeValue(
                'var(--chakra-colors-blue-600)',
                'var(--chakra-colors-blue-600)'
              )
            }}
          />
          <Text
            marginLeft={2}
            fontSize="1.1em"
            textAlign="left"
            userSelect="none"
            display={{ base: 'none', xl: 'block' }}
          >
            Imarkdown
          </Text>
        </Box>

        <Box onClick={clickMenu} _hover={{ cursor: 'pointer' }} flexShrink={0}>
          <BsThreeDotsVertical />
        </Box>
      </Flex>
      <List>
        <ListItem
          paddingY={2}
          paddingX={4}
          fontSize="1.1em"
          textAlign="left"
          userSelect="none"
          backgroundColor="rgba(255, 255, 255, 0.008)"
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
    window.ipcAPI.openRecentFile(filePath)
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
