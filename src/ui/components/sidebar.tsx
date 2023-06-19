import { FC, ReactNode } from 'react'
import SideNav from './side-nav'
import { Box, Flex, Input, Text, useColorModeValue } from '@chakra-ui/react'
import { Route, Routes } from 'react-router-dom'
import SideRecentFiles from './side-recent-files'

const Sidebar: FC = (): JSX.Element => {
  return (
    <>
      <SideNav />
      <Box
        width="300px"
        height="100%"
        overflow="auto"
        className="hidde-scroll-bar"
        backgroundColor={useColorModeValue('#F4F4F3', 'blackAlpha.600')}
      >
        <Routes>
          <Route
            path="/"
            element={
              <RouteItem title="Recent File">
                <SideRecentFiles />
              </RouteItem>
            }
          />
          <Route
            path="main_window/folder"
            element={<RouteItem title="Folder">folder</RouteItem>}
          />
        </Routes>
      </Box>
    </>
  )
}

interface RouteItemProps {
  title: string
  children: ReactNode
}

function RouteItem({ title, children }: RouteItemProps): JSX.Element {
  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        paddingBottom={4}
        position="sticky"
        zIndex={1}
        top={0}
        backgroundColor="inherit"
      >
        <Text
          as="h1"
          padding={2}
          textAlign="center"
          userSelect={'none'}
          fontSize="1.1em"
          color={useColorModeValue('gray.400', 'gray.400')}
        >
          {title}
        </Text>
        <Input
          width="90%"
          height="inherit"
          padding={2}
          fontSize="1.1em"
          placeholder="Filter"
          backgroundColor={useColorModeValue('white', 'black')}
        />
      </Flex>
      {children}
    </>
  )
}

export default Sidebar
