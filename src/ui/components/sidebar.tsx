import React, {
  forwardRef,
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  ReactNode,
  useImperativeHandle,
  useRef
} from 'react'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { Route, Routes } from 'react-router-dom'
import { BsSearch } from 'react-icons/bs'

import SideNav from './side-nav'
import SideRecentFiles from './side-recent-files'
import SideDirlist from './side-dirlist'

export interface SideBarRef {
  toggleNav: () => void
  toggleMid: () => void
}

type CompounedComponent = ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLElement> & React.RefAttributes<SideBarRef>
> & {
  __IMARKDOWN: boolean
}

const InternalSidebar: ForwardRefRenderFunction<
  SideBarRef,
  React.HTMLAttributes<HTMLElement>
> = (_props, ref) => {
  const sideNavRef = useRef<HTMLDivElement>(null)
  const midNavRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(
    ref,
    () => {
      function toggle(ref: React.MutableRefObject<HTMLDivElement>, id: number) {
        if (ref.current) {
          const display = id === 1 ? 'flex' : 'unset'
          const { current: container } = ref
          if (container.style.display === 'none') {
            container.style.display = display
          } else {
            container.style.display = 'none'
          }
        }
      }

      return {
        toggleNav() {
          toggle(sideNavRef, 1)
        },
        toggleMid() {
          toggle(midNavRef, 2)
        }
      }
    },
    []
  )
  return (
    <>
      <SideNav ref={sideNavRef} />
      <Box
        ref={midNavRef}
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
            element={
              <RouteItem title="Folder">
                <SideDirlist />
              </RouteItem>
            }
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
    <Box display="flex" flexDirection="column" height="inherit">
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        paddingBottom={4}
        zIndex={1}
        backgroundColor="unset"
        flexShrink={0}
        flexGrow={0}
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
        <Box
          aria-label="search bar"
          display="none"
          height="40px"
          width="90%"
          border="1px solid black"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.200')}
          borderStyle="solid"
          borderRadius="md"
          backgroundColor={useColorModeValue('white', 'black')}
          color={useColorModeValue('gray.600', 'gray.400')}
          justifyContent="center"
          alignItems="center"
          _hover={{ cursor: 'pointer' }}
        >
          <BsSearch />
        </Box>
      </Flex>
      <Box
        flexGrow={1}
        overflow="auto"
        display="flex"
        flexDirection="column"
        className="hidde-scroll-bar"
      >
        {children}
      </Box>
    </Box>
  )
}

const Sidebar = forwardRef<SideBarRef, React.HTMLAttributes<HTMLElement>>(
  InternalSidebar
) as CompounedComponent

Sidebar.__IMARKDOWN = true

export default Sidebar
